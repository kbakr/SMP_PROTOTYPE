import { describe, expect, it } from "vitest";
import {
  bestAttemptPerCustomer,
  canPurchase,
  canStartAttempt,
  nextBestAction,
  rankAttempts,
  resolveAttribution,
  selectBestOffer,
  RULES,
} from "../src/lib/business-rules";
import { campaignEconomics, unitContribution } from "../src/lib/economics";

describe("offer selection", () => {
  const offers = [
    {
      code: "STD500",
      purchasePrice: 500,
      voucherValue: 500,
      offerType: "standard",
      priority: 100,
      active: true,
    },
    {
      code: "RECOVER350",
      purchasePrice: 350,
      voucherValue: 500,
      offerType: "personalized",
      priority: 10,
      active: true,
      eligibleSegment: "checkout_abandoner",
    },
  ];

  it("prioritizes unused attempt over upsell", () => {
    expect(selectBestOffer(offers, { hasUnusedAttempt: true, purchaseCount: 1 })).toBeNull();
  });

  it("selects segment-eligible promo by priority", () => {
    const o = selectBestOffer(offers, {
      hasUnusedAttempt: false,
      purchaseCount: 0,
      segmentTags: ["checkout_abandoner"],
    });
    expect(o?.code).toBe("RECOVER350");
  });

  it("falls back to standard when no segment", () => {
    const o = selectBestOffer(offers, { hasUnusedAttempt: false, purchaseCount: 0 });
    expect(o?.code).toBe("STD500");
  });

  it("blocks at max five", () => {
    expect(
      selectBestOffer(offers, { hasUnusedAttempt: false, purchaseCount: RULES.maxPurchasesPerCampaign }),
    ).toBeNull();
  });
});

describe("purchase and attempt gates", () => {
  it("requires Live + before cutoff", () => {
    const ok = canPurchase({
      campaignStatus: "Live",
      purchaseCount: 0,
      now: new Date("2026-01-01"),
      purchaseCutoff: new Date("2026-02-01"),
    });
    expect(ok.ok).toBe(true);
    const closed = canPurchase({
      campaignStatus: "Closed",
      purchaseCount: 0,
      now: new Date(),
      purchaseCutoff: null,
    });
    expect(closed.ok).toBe(false);
  });

  it("requires voucher issued before play", () => {
    const bad = canStartAttempt({
      voucherStatus: "pending",
      attemptStatus: "entitled",
      campaignStatus: "Live",
      now: new Date(),
      gameplayDeadline: null,
    });
    expect(bad.ok).toBe(false);
    const good = canStartAttempt({
      voucherStatus: "issued",
      attemptStatus: "entitled",
      campaignStatus: "Live",
      now: new Date(),
      gameplayDeadline: null,
    });
    expect(good.ok).toBe(true);
  });
});

describe("leaderboard ranking", () => {
  it("ranks score DESC, time ASC, earliest ASC and isolates best per customer", () => {
    const attempts = [
      { customerId: "a", score: 4, timeMs: 40000, qualifyingAt: "2026-01-02", valid: true },
      { customerId: "a", score: 5, timeMs: 50000, qualifyingAt: "2026-01-03", valid: true },
      { customerId: "b", score: 5, timeMs: 30000, qualifyingAt: "2026-01-01", valid: true },
      { customerId: "c", score: 5, timeMs: 30000, qualifyingAt: "2026-01-02", valid: true },
      { customerId: "d", score: 3, timeMs: 10000, qualifyingAt: "2026-01-01", valid: false },
    ];
    const best = bestAttemptPerCustomer(attempts);
    expect(best.find((x) => x.customerId === "a")?.score).toBe(5);
    expect(best).toHaveLength(3);
    const ranked = rankAttempts(best);
    expect(ranked[0].customerId).toBe("b");
    expect(ranked[1].customerId).toBe("c");
    expect(ranked[2].customerId).toBe("a");
  });
});

describe("attribution", () => {
  it("uses last click in 30 days unless promo override", () => {
    const purchaseAt = new Date("2026-02-15");
    const touches = [
      {
        touchedAt: "2026-02-01",
        isOverride: false,
        source: "instagram",
        partnerId: "p1",
      },
      {
        touchedAt: "2026-02-10",
        isOverride: false,
        source: "crm",
        partnerId: "p2",
      },
      {
        touchedAt: "2026-02-12",
        isOverride: true,
        promoCode: "PARTNERX",
        partnerId: "p3",
      },
    ];
    const resolved = resolveAttribution(touches, purchaseAt);
    expect(resolved?.partnerId).toBe("p3");
  });
});

describe("NBA", () => {
  it("prefers play when unused attempt exists", () => {
    expect(
      nextBestAction({
        unusedAttempts: 1,
        purchaseCount: 1,
        campaignStatus: "Live",
        hasEligibleReplayOffer: true,
      }).action,
    ).toBe("play");
  });
});

describe("economics", () => {
  it("does not apply standard contribution to promo purchase", () => {
    const std = unitContribution({ amount: 500, voucherFaceValue: 500, isNewPayer: true });
    const promo = unitContribution({ amount: 350, voucherFaceValue: 500, isNewPayer: true });
    expect(promo.contribution).toBeLessThan(std.contribution);
    expect(Math.round(std.contribution)).toBeGreaterThan(200);
  });

  it("aggregates campaign economics from records", () => {
    const summary = campaignEconomics({
      transactions: [
        { amount: 500, voucherFaceValue: 500, isNewPayer: true },
        { amount: 350, voucherFaceValue: 500, isNewPayer: false },
      ],
      visitors: 100,
      leads: 20,
    });
    expect(summary.revenue).toBe(850);
    expect(summary.transactions).toBe(2);
    expect(summary.breakEvenPayers).toBeGreaterThan(1000);
  });
});
