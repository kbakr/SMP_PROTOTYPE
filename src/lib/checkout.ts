import { prisma } from "./db";
import {
  canPurchase,
  canStartAttempt,
  resolveAttribution,
  RULES,
} from "./business-rules";
import { unitContribution } from "./economics";
import { recomputeCampaignLeaderboard } from "./leaderboard";
import { randomBytes } from "crypto";

export async function simulateOtp(phone: string, code: string) {
  const expected = process.env.DEMO_OTP_CODE || "123456";
  if (code !== expected) return { ok: false as const, error: "Invalid demo OTP" };

  let customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) {
    const parts = phone.slice(-4);
    customer = await prisma.customer.create({
      data: {
        phone,
        firstName: "Guest",
        lastName: parts,
        displayName: `Guest ${parts}`,
        otpVerified: true,
        ageVerified: true,
        isDemo: true,
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { otpVerified: true },
    });
  }

  await prisma.customerEvent.create({
    data: { customerId: customer.id, type: "otp_verified", payload: JSON.stringify({ phone }) },
  });

  const session = await prisma.appSession.create({
    data: {
      token: randomBytes(24).toString("hex"),
      customerId: customer.id,
      role: phone === process.env.DEMO_ADMIN_PHONE ? "admin" : "customer",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
    },
  });

  return { ok: true as const, customer, session };
}

export async function recordLpAttribution(opts: {
  landingPageSlug: string;
  customerId?: string;
  sessionToken?: string;
}) {
  const lp = await prisma.landingPage.findUnique({
    where: { slug: opts.landingPageSlug },
    include: { campaign: true, partner: true },
  });
  if (!lp || !lp.active) return null;

  const touch = await prisma.attributionTouch.create({
    data: {
      customerId: opts.customerId,
      campaignId: lp.campaignId,
      landingPageId: lp.id,
      partnerId: lp.partnerId,
      source: lp.utmSource,
      medium: lp.utmMedium,
      expiresAt: new Date(Date.now() + RULES.attributionWindowDays * 24 * 60 * 60_000),
    },
  });

  await prisma.customerEvent.create({
    data: {
      customerId: opts.customerId,
      campaignId: lp.campaignId,
      type: "lp_click",
      payload: JSON.stringify({ slug: lp.slug, touchId: touch.id }),
    },
  });

  return { lp, touch };
}

export async function createCheckout(opts: {
  customerId: string;
  campaignSlug: string;
  offerCode?: string;
  idempotencyKey: string;
}) {
  const existing = await prisma.transaction.findUnique({
    where: { idempotencyKey: opts.idempotencyKey },
    include: { voucher: true },
  });
  if (existing) return { ok: true as const, transaction: existing, idempotent: true };

  const campaign = await prisma.campaign.findUnique({
    where: { slug: opts.campaignSlug },
    include: { offers: true, merchant: true },
  });
  if (!campaign) return { ok: false as const, error: "Campaign not found" };

  const cc = await prisma.customerCampaign.findUnique({
    where: {
      customerId_campaignId: { customerId: opts.customerId, campaignId: campaign.id },
    },
  });
  const purchaseCount = cc?.purchaseCount ?? 0;
  const gate = canPurchase({
    campaignStatus: campaign.status,
    purchaseCount,
    now: new Date(),
    purchaseCutoff: campaign.purchaseCutoff,
  });
  if (!gate.ok) return { ok: false as const, error: gate.reason };

  let offer = campaign.offers.find((o) => o.code === opts.offerCode && o.active);
  if (!offer) offer = campaign.offers.find((o) => o.offerType === "standard" && o.active);
  if (!offer) {
    return {
      ok: false as const,
      error: "No offer available",
    };
  }

  const touches = await prisma.attributionTouch.findMany({
    where: { customerId: opts.customerId, campaignId: campaign.id },
    orderBy: { touchedAt: "desc" },
  });
  const attr = resolveAttribution(touches, new Date());

  const isFirstPayer = !cc || !cc.firstPayer;

  const tx = await prisma.transaction.create({
    data: {
      customerId: opts.customerId,
      campaignId: campaign.id,
      offerId: offer.id,
      amount: offer.purchasePrice,
      voucherValue: offer.voucherValue,
      status: "pending",
      idempotencyKey: opts.idempotencyKey,
      isFirstPayer,
      attributionJson: attr ? JSON.stringify(attr) : null,
    },
  });

  await prisma.customerEvent.create({
    data: {
      customerId: opts.customerId,
      campaignId: campaign.id,
      type: "checkout_started",
      payload: JSON.stringify({ transactionId: tx.id, offer: offer.code, amount: offer.purchasePrice }),
    },
  });

  return { ok: true as const, transaction: tx, offer, campaign, idempotent: false };
}

export async function simulatePayment(opts: {
  idempotencyKey: string;
  outcome?: "success" | "failure";
}) {
  const tx = await prisma.transaction.findUnique({
    where: { idempotencyKey: opts.idempotencyKey },
    include: { campaign: { include: { merchant: true } }, customer: true, offer: true },
  });
  if (!tx) return { ok: false as const, error: "Transaction not found" };
  if (tx.status === "succeeded" && tx) {
    const voucher = await prisma.voucher.findUnique({ where: { transactionId: tx.id } });
    return { ok: true as const, transaction: tx, voucher, idempotent: true };
  }

  const outcome = opts.outcome ?? "success";
  if (outcome === "failure") {
    const failed = await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "failed" },
    });
    await prisma.customerEvent.create({
      data: {
        customerId: tx.customerId,
        campaignId: tx.campaignId,
        type: "payment_failed",
        payload: JSON.stringify({ transactionId: tx.id }),
      },
    });
    return { ok: false as const, error: "Simulated payment failure", transaction: failed };
  }

  // Success path: payment → voucher → attempt entitlement
  const updated = await prisma.transaction.update({
    where: { id: tx.id },
    data: { status: "succeeded", paymentRef: `SIM-${Date.now()}` },
  });

  const code = `VCH-${randomBytes(4).toString("hex").toUpperCase()}`;
  const voucher = await prisma.voucher.create({
    data: {
      code,
      customerId: tx.customerId,
      campaignId: tx.campaignId,
      merchantId: tx.campaign.merchantId,
      transactionId: tx.id,
      faceValue: tx.voucherValue,
      costValue: RULES.voucherCostWorking,
      status: "issued",
      terms: tx.campaign.voucherTerms,
    },
  });

  const attempt = await prisma.attempt.create({
    data: {
      customerId: tx.customerId,
      campaignId: tx.campaignId,
      voucherId: voucher.id,
      status: "entitled",
    },
  });

  const econ = unitContribution({
    amount: tx.amount,
    voucherFaceValue: tx.voucherValue,
    isNewPayer: tx.isFirstPayer,
  });

  await prisma.financialEvent.create({
    data: {
      campaignId: tx.campaignId,
      transactionId: tx.id,
      type: "purchase",
      amount: tx.amount,
      metaJson: JSON.stringify({ ...econ, offer: tx.offer?.code }),
    },
  });

  await prisma.customerCampaign.upsert({
    where: {
      customerId_campaignId: { customerId: tx.customerId, campaignId: tx.campaignId },
    },
    create: {
      customerId: tx.customerId,
      campaignId: tx.campaignId,
      purchaseCount: 1,
      unusedAttempts: 1,
      lifecycle: "voucher_ready",
      firstPayer: tx.isFirstPayer,
      ltv: tx.amount,
      contribution: econ.contribution,
    },
    update: {
      purchaseCount: { increment: 1 },
      unusedAttempts: { increment: 1 },
      lifecycle: "voucher_ready",
      firstPayer: tx.isFirstPayer ? true : undefined,
      ltv: { increment: tx.amount },
      contribution: { increment: econ.contribution },
    },
  });

  await prisma.customerEvent.createMany({
    data: [
      {
        customerId: tx.customerId,
        campaignId: tx.campaignId,
        type: "purchase_succeeded",
        payload: JSON.stringify({ amount: tx.amount, voucher: code }),
      },
      {
        customerId: tx.customerId,
        campaignId: tx.campaignId,
        type: "voucher_issued",
        payload: JSON.stringify({ code, beforeAttempt: true }),
      },
      {
        customerId: tx.customerId,
        campaignId: tx.campaignId,
        type: "attempt_entitled",
        payload: JSON.stringify({ attemptId: attempt.id }),
      },
    ],
  });

  return { ok: true as const, transaction: updated, voucher, attempt, idempotent: false };
}

export async function abandonCheckout(opts: {
  customerId: string;
  campaignId: string;
  step?: string;
}) {
  await prisma.customerCampaign.upsert({
    where: {
      customerId_campaignId: { customerId: opts.customerId, campaignId: opts.campaignId },
    },
    create: {
      customerId: opts.customerId,
      campaignId: opts.campaignId,
      lifecycle: "checkout_abandoner",
    },
    update: { lifecycle: "checkout_abandoner" },
  });
  await prisma.customerEvent.create({
    data: {
      customerId: opts.customerId,
      campaignId: opts.campaignId,
      type: "checkout_abandon",
      payload: JSON.stringify({ step: opts.step ?? "payment" }),
    },
  });
}

export async function startChallenge(attemptId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { voucher: true, campaign: true },
  });
  if (!attempt) return { ok: false as const, error: "Attempt not found" };

  const gate = canStartAttempt({
    voucherStatus: attempt.voucher.status,
    attemptStatus: attempt.status,
    campaignStatus: attempt.campaign.status,
    now: new Date(),
    gameplayDeadline: attempt.campaign.gameplayDeadline,
  });
  if (!gate.ok) return { ok: false as const, error: gate.reason };

  if (attempt.status === "in_progress" && attempt.serverStartAt) {
    return { ok: true as const, attempt, resumed: true };
  }

  const now = new Date();
  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: { status: "in_progress", startedAt: now, serverStartAt: now },
  });

  await prisma.customerEvent.create({
    data: {
      customerId: attempt.customerId,
      campaignId: attempt.campaignId,
      type: "challenge_started",
      payload: JSON.stringify({ attemptId }),
    },
  });

  return { ok: true as const, attempt: updated, resumed: false };
}

export async function submitChallenge(opts: {
  attemptId: string;
  answers: { questionId: string; selectedIndex: number }[];
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: opts.attemptId },
    include: {
      campaign: { include: { questions: true } },
      voucher: true,
      responses: true,
    },
  });
  if (!attempt) return { ok: false as const, error: "Attempt not found" };
  if (attempt.status === "completed") {
    return { ok: false as const, error: "Attempt already submitted" };
  }
  if (attempt.status !== "in_progress" || !attempt.serverStartAt) {
    return { ok: false as const, error: "Attempt not started" };
  }

  const serverEnd = new Date();
  const timeMs = Math.max(0, serverEnd.getTime() - attempt.serverStartAt.getTime());
  const timedOut = timeMs > attempt.campaign.timerSeconds * 1000 + 2000; // 2s grace for network

  const questions = attempt.campaign.questions.sort((a, b) => a.orderIndex - b.orderIndex);
  let score = 0;
  for (const q of questions) {
    const ans = opts.answers.find((a) => a.questionId === q.id);
    const selected = ans?.selectedIndex ?? -1;
    if (selected === q.correctIndex) score += 1;
    await prisma.challengeResponse.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId: q.id } },
      create: {
        attemptId: attempt.id,
        questionId: q.id,
        selectedIndex: selected,
      },
      update: { selectedIndex: selected },
    });
  }

  const cappedTime = Math.min(timeMs, attempt.campaign.timerSeconds * 1000);

  const updated = await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      status: "completed",
      finishedAt: serverEnd,
      serverEndAt: serverEnd,
      score,
      timeMs: cappedTime,
      valid: true,
      invalidReason: timedOut ? "timer_exceeded_grace_applied" : null,
    },
  });

  await prisma.customerCampaign.updateMany({
    where: { customerId: attempt.customerId, campaignId: attempt.campaignId },
    data: {
      attemptCount: { increment: 1 },
      unusedAttempts: { decrement: 1 },
      lifecycle: "played",
    },
  });

  await prisma.customerEvent.create({
    data: {
      customerId: attempt.customerId,
      campaignId: attempt.campaignId,
      type: "challenge_completed",
      payload: JSON.stringify({ score, timeMs: cappedTime }),
    },
  });

  const ranked = await recomputeCampaignLeaderboard(attempt.campaignId);
  const mine = ranked.find((r) => r.customerId === attempt.customerId);

  return {
    ok: true as const,
    attempt: updated,
    score,
    timeMs: cappedTime,
    rank: mine?.rank ?? null,
  };
}
