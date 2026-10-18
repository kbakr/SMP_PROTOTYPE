/** Core commercial & competition rules — keep in sync with master prompt */

export const RULES = {
  maxPurchasesPerCampaign: 5,
  challengeQuestions: 5,
  challengeSeconds: 60,
  purchaseCutoffMinutesBeforeDeadline: 10,
  attributionWindowDays: 30,
  standardPrice: 500,
  standardVoucherValue: 500,
  promoPriceExample: 350,
  voucherCostWorking: 50,
  providerPayoutRate: 0.93,
  vatRate: 0.14,
  refundReserveRate: 0.02,
  cpaNewPayer: 150,
  purchasesPerCustomer: 1.05,
  prizeRegulatoryWorking: 156_200,
  operatingCeiling: 200_000,
  conservativeFixed: 356_200,
  minAge: 18,
} as const;

export type OfferInput = {
  purchasePrice: number;
  voucherValue: number;
  code: string;
  offerType: string;
  priority: number;
  active: boolean;
  eligibleSegment?: string | null;
};

export function selectBestOffer(
  offers: OfferInput[],
  ctx: { hasUnusedAttempt: boolean; purchaseCount: number; segmentTags?: string[] },
): OfferInput | null {
  if (ctx.hasUnusedAttempt) return null; // NBA: play existing attempt first
  if (ctx.purchaseCount >= RULES.maxPurchasesPerCampaign) return null;

  const eligible = offers
    .filter((o) => o.active)
    .filter((o) => {
      if (!o.eligibleSegment) return true;
      return (ctx.segmentTags || []).includes(o.eligibleSegment);
    })
    .sort((a, b) => a.priority - b.priority);

  return eligible[0] ?? null;
}

export function canPurchase(opts: {
  campaignStatus: string;
  purchaseCount: number;
  now: Date;
  purchaseCutoff: Date | null;
}): { ok: boolean; reason?: string } {
  const liveStatuses = ["Live"];
  if (!liveStatuses.includes(opts.campaignStatus)) {
    return { ok: false, reason: "Campaign is not open for purchase" };
  }
  if (opts.purchaseCount >= RULES.maxPurchasesPerCampaign) {
    return { ok: false, reason: "Maximum purchases reached for this campaign" };
  }
  if (opts.purchaseCutoff && opts.now >= opts.purchaseCutoff) {
    return { ok: false, reason: "Purchase cutoff has passed" };
  }
  return { ok: true };
}

export function canStartAttempt(opts: {
  voucherStatus: string;
  attemptStatus: string;
  campaignStatus: string;
  now: Date;
  gameplayDeadline: Date | null;
}): { ok: boolean; reason?: string } {
  if (opts.voucherStatus !== "issued" && opts.voucherStatus !== "redeemed") {
    return { ok: false, reason: "Voucher must be issued before challenge access" };
  }
  if (opts.attemptStatus !== "entitled" && opts.attemptStatus !== "in_progress") {
    return { ok: false, reason: "No unused attempt entitlement" };
  }
  if (!["Live", "Closing"].includes(opts.campaignStatus)) {
    return { ok: false, reason: "Campaign not open for play" };
  }
  if (opts.gameplayDeadline && opts.now >= opts.gameplayDeadline) {
    return { ok: false, reason: "Gameplay deadline has passed" };
  }
  return { ok: true };
}

export function computePurchaseCutoff(gameplayDeadline: Date): Date {
  return new Date(
    gameplayDeadline.getTime() - RULES.purchaseCutoffMinutesBeforeDeadline * 60_000,
  );
}

export function rankAttempts<
  T extends { score: number; timeMs: number; qualifyingAt: Date | string; customerId: string },
>(attempts: T[]): (T & { rank: number })[] {
  const sorted = [...attempts].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
    const ta = new Date(a.qualifyingAt).getTime();
    const tb = new Date(b.qualifyingAt).getTime();
    return ta - tb;
  });
  return sorted.map((row, i) => ({ ...row, rank: i + 1 }));
}

/** Best valid attempt per customer within one campaign */
export function bestAttemptPerCustomer<
  T extends {
    customerId: string;
    score: number;
    timeMs: number;
    qualifyingAt: Date | string;
    valid: boolean;
  },
>(attempts: T[]): T[] {
  const map = new Map<string, T>();
  for (const a of attempts.filter((x) => x.valid)) {
    const prev = map.get(a.customerId);
    if (!prev) {
      map.set(a.customerId, a);
      continue;
    }
    const better =
      a.score > prev.score ||
      (a.score === prev.score && a.timeMs < prev.timeMs) ||
      (a.score === prev.score &&
        a.timeMs === prev.timeMs &&
        new Date(a.qualifyingAt).getTime() < new Date(prev.qualifyingAt).getTime());
    if (better) map.set(a.customerId, a);
  }
  return [...map.values()];
}

export function resolveAttribution(
  touches: Array<{
    touchedAt: Date | string;
    expiresAt?: Date | string | null;
    isOverride: boolean;
    promoCode?: string | null;
    partnerId?: string | null;
    landingPageId?: string | null;
    source?: string | null;
  }>,
  purchaseAt: Date,
): (typeof touches)[number] | null {
  const windowMs = RULES.attributionWindowDays * 24 * 60 * 60_000;
  const inWindow = touches.filter((t) => {
    const touched = new Date(t.touchedAt).getTime();
    if (touched > purchaseAt.getTime()) return false;
    if (purchaseAt.getTime() - touched > windowMs) return false;
    if (t.expiresAt && new Date(t.expiresAt) < purchaseAt) return false;
    return true;
  });
  const override = inWindow.find((t) => t.isOverride && t.promoCode);
  if (override) return override;
  return (
    [...inWindow].sort(
      (a, b) => new Date(b.touchedAt).getTime() - new Date(a.touchedAt).getTime(),
    )[0] ?? null
  );
}

export function nextBestAction(ctx: {
  unusedAttempts: number;
  purchaseCount: number;
  campaignStatus: string;
  hasEligibleReplayOffer: boolean;
}): { action: string; label: string } {
  if (ctx.unusedAttempts > 0) {
    return { action: "play", label: "Play your unused attempt" };
  }
  if (
    ctx.campaignStatus === "Live" &&
    ctx.purchaseCount < RULES.maxPurchasesPerCampaign &&
    ctx.hasEligibleReplayOffer
  ) {
    return { action: "replay", label: "Claim replay offer" };
  }
  if (ctx.campaignStatus === "Live" && ctx.purchaseCount < RULES.maxPurchasesPerCampaign) {
    return { action: "purchase", label: "Enter campaign" };
  }
  return { action: "browse", label: "Browse campaigns" };
}
