import { describe, expect, it } from "vitest";
import { RULES } from "../src/lib/business-rules";
import { validateCampaignBuilderInput } from "../src/lib/campaign-builder";
import { nbaLabel, tr } from "../src/lib/i18n-helpers";

function sampleQuestions(n = RULES.challengeQuestions) {
  return Array.from({ length: n }, (_, i) => ({
    promptEn: `Q${i + 1} EN`,
    promptAr: `س${i + 1}`,
    options: ["A", "B", "C", "D"],
    optionsAr: ["أ", "ب", "ج", "د"],
    correctIndex: 1,
  }));
}

describe("campaign builder validation", () => {
  it("accepts a complete campaign with prize and 5 questions", () => {
    const result = validateCampaignBuilderInput({
      slug: "demo-builder-phone",
      name: "Builder Phone",
      nameAr: "هاتف المنشئ",
      standardPrice: RULES.standardPrice,
      standardVoucherValue: RULES.standardVoucherValue,
      maxPurchasesPerUser: RULES.maxPurchasesPerCampaign,
      questionCount: RULES.challengeQuestions,
      timerSeconds: RULES.challengeSeconds,
      prize: { name: "Phone", nameAr: "هاتف" },
      questions: sampleQuestions(),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.questions).toHaveLength(5);
      expect(result.data.standardPrice).toBe(500);
      expect(result.data.purchaseCutoff).toBeNull();
      expect(JSON.parse(result.data.questions[0].optionsAr!)).toEqual(["أ", "ب", "ج", "د"]);
    }
  });

  it("computes purchase cutoff from gameplay deadline", () => {
    const deadline = new Date("2030-01-01T12:00:00.000Z");
    const result = validateCampaignBuilderInput({
      slug: "cutoff-test",
      name: "Cutoff",
      gameplayDeadline: deadline.toISOString(),
      prize: { name: "Prize" },
      questions: sampleQuestions(),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.purchaseCutoff!.getTime()).toBe(
        deadline.getTime() - RULES.purchaseCutoffMinutesBeforeDeadline * 60_000,
      );
    }
  });

  it("rejects bad slug and wrong question count", () => {
    expect(
      validateCampaignBuilderInput({
        slug: "Bad Slug",
        name: "X",
        prize: { name: "P" },
        questions: sampleQuestions(),
      }).ok,
    ).toBe(false);

    expect(
      validateCampaignBuilderInput({
        slug: "ok-slug",
        name: "X",
        prize: { name: "P" },
        questions: sampleQuestions(3),
      }).ok,
    ).toBe(false);
  });

  it("rejects max purchases above commercial cap", () => {
    const result = validateCampaignBuilderInput({
      slug: "too-many",
      name: "X",
      maxPurchasesPerUser: RULES.maxPurchasesPerCampaign + 1,
      prize: { name: "P" },
      questions: sampleQuestions(),
    });
    expect(result.ok).toBe(false);
  });
});

describe("i18n helpers", () => {
  it("tr prefers Arabic when locale is ar", () => {
    expect(tr("ar", "Hello", "مرحبا")).toBe("مرحبا");
    expect(tr("en", "Hello", "مرحبا")).toBe("Hello");
    expect(tr("ar", "Hello", null)).toBe("Hello");
  });

  it("maps NBA actions to Arabic labels", () => {
    expect(nbaLabel("ar", "play")).toContain("محاولتك");
    expect(nbaLabel("en", "purchase")).toBe("Enter campaign");
  });
});
