import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RULES } from "@/lib/business-rules";
import {
  validateCampaignBuilderInput,
  type BuilderCampaignInput,
} from "@/lib/campaign-builder";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  if (id || slug) {
    const campaign = await prisma.campaign.findFirst({
      where: id ? { id } : { slug: slug! },
      include: {
        prize: true,
        merchant: true,
        questions: { orderBy: { orderIndex: "asc" } },
        offers: { orderBy: { priority: "asc" } },
      },
    });
    if (!campaign) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    const merchants = await prisma.merchant.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ ok: true, campaign, merchants });
  }

  const campaigns = await prisma.campaign.findMany({
    include: {
      prize: true,
      merchant: true,
      _count: { select: { questions: true, offers: true } },
    },
    orderBy: { homeSortOrder: "asc" },
  });
  const modules = await prisma.homepageModuleConfig.findMany({ orderBy: { sortOrder: "asc" } });
  const merchants = await prisma.merchant.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ campaigns, modules, merchants });
}

export async function POST(req: Request) {
  const body = (await req.json()) as BuilderCampaignInput;
  const validated = validateCampaignBuilderInput(body);
  if (!validated.ok) return NextResponse.json(validated, { status: 400 });
  const data = validated.data;

  const existing = await prisma.campaign.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });
  }

  const market = await prisma.market.findFirst({ where: { code: "EG" } });
  if (!market) {
    return NextResponse.json({ ok: false, error: "Market EG missing — run seed" }, { status: 500 });
  }

  if (data.merchantId) {
    const m = await prisma.merchant.findUnique({ where: { id: data.merchantId } });
    if (!m) return NextResponse.json({ ok: false, error: "Merchant not found" }, { status: 400 });
  }

  const maxSort = await prisma.campaign.aggregate({ _max: { homeSortOrder: true } });
  const homeSortOrder = (maxSort._max.homeSortOrder ?? 0) + 10;

  const created = await prisma.$transaction(async (tx) => {
    const prize = await tx.prize.create({
      data: {
        name: data.prize.name,
        nameAr: data.prize.nameAr,
        description: data.prize.description,
        descriptionAr: data.prize.descriptionAr,
        imageUrl: data.prize.imageUrl,
        estimatedValue: data.prize.estimatedValue ?? undefined,
        secured: data.prize.secured,
      },
    });

    const campaign = await tx.campaign.create({
      data: {
        slug: data.slug,
        name: data.name,
        nameAr: data.nameAr,
        tagline: data.tagline,
        taglineAr: data.taglineAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        status: data.status,
        marketId: market.id,
        merchantId: data.merchantId,
        prizeId: prize.id,
        standardPrice: data.standardPrice,
        standardVoucherValue: data.standardVoucherValue,
        maxPurchasesPerUser: data.maxPurchasesPerUser,
        questionCount: data.questionCount,
        timerSeconds: data.timerSeconds,
        gameplayDeadline: data.gameplayDeadline,
        purchaseCutoff: data.purchaseCutoff,
        brandColor: data.brandColor,
        heroImageUrl: data.heroImageUrl,
        cardImageUrl: data.cardImageUrl,
        rulesText: data.rulesText,
        rulesTextAr: data.rulesTextAr,
        voucherTerms: data.voucherTerms,
        voucherTermsAr: data.voucherTermsAr,
        showOnHome: data.status === "Live" || data.status === "Scheduled",
        showInDirectory: true,
        featured: false,
        homeSortOrder,
        showLeaderboard: true,
        showWinners: true,
        showInUpcoming: data.status === "Scheduled",
        showInPast: false,
      },
    });

    for (const q of data.questions) {
      await tx.question.create({
        data: {
          campaignId: campaign.id,
          orderIndex: q.orderIndex,
          promptEn: q.promptEn,
          promptAr: q.promptAr,
          optionsJson: q.optionsJson,
          optionsAr: q.optionsAr,
          correctIndex: q.correctIndex,
        },
      });
    }

    if (data.createStandardOffer) {
      await tx.offer.create({
        data: {
          campaignId: campaign.id,
          code: "STD500",
          name: `Standard ${data.standardPrice}/${data.standardVoucherValue}`,
          purchasePrice: data.standardPrice,
          voucherValue: data.standardVoucherValue,
          offerType: "standard",
          priority: 100,
          active: true,
        },
      });
    }

    await tx.customerEvent.create({
      data: {
        type: "admin_campaign_created",
        campaignId: campaign.id,
        payload: JSON.stringify({ slug: campaign.slug, questionCount: data.questionCount }),
      },
    });

    return tx.campaign.findUniqueOrThrow({
      where: { id: campaign.id },
      include: { prize: true, questions: { orderBy: { orderIndex: "asc" } }, offers: true },
    });
  });

  return NextResponse.json({ ok: true, campaign: created });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const before = await prisma.campaign.findUnique({
    where: { id },
    include: { prize: true, questions: true },
  });
  if (!before) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const validated = validateCampaignBuilderInput({
    ...body,
    slug: body.slug || before.slug,
  } as BuilderCampaignInput);
  if (!validated.ok) return NextResponse.json(validated, { status: 400 });
  const data = validated.data;

  if (data.slug !== before.slug) {
    const clash = await prisma.campaign.findUnique({ where: { slug: data.slug } });
    if (clash) {
      return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });
    }
  }

  // Live commercial terms: allow edit in demo builder but log clearly
  const updated = await prisma.$transaction(async (tx) => {
    if (before.prizeId) {
      await tx.prize.update({
        where: { id: before.prizeId },
        data: {
          name: data.prize.name,
          nameAr: data.prize.nameAr,
          description: data.prize.description,
          descriptionAr: data.prize.descriptionAr,
          imageUrl: data.prize.imageUrl,
          estimatedValue: data.prize.estimatedValue ?? undefined,
          secured: data.prize.secured,
        },
      });
    } else {
      const prize = await tx.prize.create({
        data: {
          name: data.prize.name,
          nameAr: data.prize.nameAr,
          description: data.prize.description,
          descriptionAr: data.prize.descriptionAr,
          imageUrl: data.prize.imageUrl,
          estimatedValue: data.prize.estimatedValue ?? undefined,
          secured: data.prize.secured,
        },
      });
      await tx.campaign.update({ where: { id }, data: { prizeId: prize.id } });
    }

    // Upsert by orderIndex so existing challenge responses keep their question FKs
    for (const q of data.questions) {
      await tx.question.upsert({
        where: {
          campaignId_orderIndex: { campaignId: id, orderIndex: q.orderIndex },
        },
        create: {
          campaignId: id,
          orderIndex: q.orderIndex,
          promptEn: q.promptEn,
          promptAr: q.promptAr,
          optionsJson: q.optionsJson,
          optionsAr: q.optionsAr,
          correctIndex: q.correctIndex,
        },
        update: {
          promptEn: q.promptEn,
          promptAr: q.promptAr,
          optionsJson: q.optionsJson,
          optionsAr: q.optionsAr,
          correctIndex: q.correctIndex,
        },
      });
    }
    const keepIndexes = data.questions.map((q) => q.orderIndex);
    const orphans = await tx.question.findMany({
      where: { campaignId: id, orderIndex: { notIn: keepIndexes } },
      include: { _count: { select: { responses: true } } },
    });
    for (const orphan of orphans) {
      if (orphan._count.responses === 0) {
        await tx.question.delete({ where: { id: orphan.id } });
      }
    }

    const campaign = await tx.campaign.update({
      where: { id },
      data: {
        slug: data.slug,
        name: data.name,
        nameAr: data.nameAr,
        tagline: data.tagline,
        taglineAr: data.taglineAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        status: data.status,
        merchantId: data.merchantId,
        standardPrice: data.standardPrice,
        standardVoucherValue: data.standardVoucherValue,
        maxPurchasesPerUser: data.maxPurchasesPerUser,
        questionCount: data.questionCount,
        timerSeconds: data.timerSeconds,
        gameplayDeadline: data.gameplayDeadline,
        purchaseCutoff: data.purchaseCutoff,
        brandColor: data.brandColor,
        heroImageUrl: data.heroImageUrl,
        cardImageUrl: data.cardImageUrl,
        rulesText: data.rulesText,
        rulesTextAr: data.rulesTextAr,
        voucherTerms: data.voucherTerms,
        voucherTermsAr: data.voucherTermsAr,
      },
      include: {
        prize: true,
        questions: { orderBy: { orderIndex: "asc" } },
        offers: true,
      },
    });

    // Keep standard offer price/voucher in sync when present
    const std = campaign.offers.find((o) => o.offerType === "standard" || o.code === "STD500");
    if (std) {
      await tx.offer.update({
        where: { id: std.id },
        data: {
          purchasePrice: data.standardPrice,
          voucherValue: data.standardVoucherValue,
          name: `Standard ${data.standardPrice}/${data.standardVoucherValue}`,
        },
      });
    } else if (data.createStandardOffer) {
      await tx.offer.create({
        data: {
          campaignId: id,
          code: "STD500",
          name: `Standard ${data.standardPrice}/${data.standardVoucherValue}`,
          purchasePrice: data.standardPrice,
          voucherValue: data.standardVoucherValue,
          offerType: "standard",
          priority: 100,
          active: true,
        },
      });
    }

    await tx.customerEvent.create({
      data: {
        type: "admin_campaign_updated",
        campaignId: id,
        payload: JSON.stringify({
          slug: data.slug,
          wasLive: before.status === "Live",
          rules: {
            maxPurchases: RULES.maxPurchasesPerCampaign,
            questions: RULES.challengeQuestions,
          },
        }),
      },
    });

    return campaign;
  });

  return NextResponse.json({ ok: true, campaign: updated });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  if (body.type === "campaign") {
    const before = await prisma.campaign.findUnique({ where: { id: body.id } });
    if (!before) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    const allowed = [
      "showOnHome",
      "showInDirectory",
      "featured",
      "homeSortOrder",
      "showLeaderboard",
      "showWinners",
      "showInUpcoming",
      "showInPast",
      "status",
    ] as const;
    for (const k of allowed) {
      if (k in body) data[k] = body[k];
    }

    const updated = await prisma.campaign.update({ where: { id: body.id }, data });
    await prisma.customerEvent.create({
      data: {
        type: "admin_campaign_visibility",
        campaignId: updated.id,
        payload: JSON.stringify({
          before: Object.fromEntries(allowed.map((k) => [k, before[k as keyof typeof before]])),
          after: Object.fromEntries(allowed.map((k) => [k, updated[k as keyof typeof updated]])),
        }),
      },
    });
    return NextResponse.json({ ok: true, campaign: updated });
  }

  if (body.type === "module") {
    const updated = await prisma.homepageModuleConfig.update({
      where: { key: body.key },
      data: {
        ...(typeof body.enabled === "boolean" ? { enabled: body.enabled } : {}),
        ...(typeof body.sortOrder === "number" ? { sortOrder: body.sortOrder } : {}),
      },
    });
    return NextResponse.json({ ok: true, module: updated });
  }

  return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
}
