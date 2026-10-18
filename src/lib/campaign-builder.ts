import { RULES } from "./business-rules";
import { serializeQuestionOptions } from "./question-options";

export type BuilderQuestionInput = {
  promptEn: string;
  promptAr?: string | null;
  options: string[];
  optionsAr?: string[] | null;
  correctIndex: number;
};

export type BuilderPrizeInput = {
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  imageUrl?: string | null;
  estimatedValue?: number | null;
  secured?: boolean;
};

export type BuilderCampaignInput = {
  slug: string;
  name: string;
  nameAr?: string | null;
  tagline?: string | null;
  taglineAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  status?: string;
  standardPrice?: number;
  standardVoucherValue?: number;
  maxPurchasesPerUser?: number;
  questionCount?: number;
  timerSeconds?: number;
  gameplayDeadline?: string | Date | null;
  brandColor?: string | null;
  heroImageUrl?: string | null;
  cardImageUrl?: string | null;
  rulesText?: string | null;
  rulesTextAr?: string | null;
  voucherTerms?: string | null;
  voucherTermsAr?: string | null;
  merchantId?: string | null;
  prize: BuilderPrizeInput;
  questions: BuilderQuestionInput[];
  createStandardOffer?: boolean;
};

export type BuilderValidation =
  | { ok: true; data: NormalizedBuilderCampaign }
  | { ok: false; error: string };

export type NormalizedBuilderCampaign = {
  slug: string;
  name: string;
  nameAr: string | null;
  tagline: string | null;
  taglineAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  status: string;
  standardPrice: number;
  standardVoucherValue: number;
  maxPurchasesPerUser: number;
  questionCount: number;
  timerSeconds: number;
  gameplayDeadline: Date | null;
  purchaseCutoff: Date | null;
  brandColor: string | null;
  heroImageUrl: string | null;
  cardImageUrl: string | null;
  rulesText: string | null;
  rulesTextAr: string | null;
  voucherTerms: string | null;
  voucherTermsAr: string | null;
  merchantId: string | null;
  prize: {
    name: string;
    nameAr: string | null;
    description: string | null;
    descriptionAr: string | null;
    imageUrl: string | null;
    estimatedValue: number | null;
    secured: boolean;
  };
  questions: Array<{
    orderIndex: number;
    promptEn: string;
    promptAr: string | null;
    optionsJson: string;
    correctIndex: number;
  }>;
  createStandardOffer: boolean;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STATUSES = new Set(["Draft", "Scheduled", "Live", "Paused", "Closed", "Archived"]);

function asNum(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function validateCampaignBuilderInput(raw: BuilderCampaignInput): BuilderValidation {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid body" };

  const slug = String(raw.slug || "")
    .trim()
    .toLowerCase();
  if (!slug || !SLUG_RE.test(slug)) {
    return { ok: false, error: "Slug must be lowercase kebab-case (a-z, 0-9, hyphens)" };
  }

  const name = String(raw.name || "").trim();
  if (!name) return { ok: false, error: "Campaign name is required" };

  const prizeName = String(raw.prize?.name || "").trim();
  if (!prizeName) return { ok: false, error: "Prize name is required" };

  const questions = Array.isArray(raw.questions) ? raw.questions : [];
  const questionCount = Math.max(1, Math.round(asNum(raw.questionCount, RULES.challengeQuestions)));
  if (questions.length !== questionCount) {
    return {
      ok: false,
      error: `Provide exactly ${questionCount} questions (got ${questions.length})`,
    };
  }

  const normalizedQs: NormalizedBuilderCampaign["questions"] = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const promptEn = String(q.promptEn || "").trim();
    if (!promptEn) return { ok: false, error: `Question ${i + 1}: English prompt required` };
    const options = Array.isArray(q.options) ? q.options.map((o) => String(o).trim()) : [];
    if (options.length < 2 || options.some((o) => !o)) {
      return { ok: false, error: `Question ${i + 1}: need at least 2 non-empty options` };
    }
    const correctIndex = Math.round(asNum(q.correctIndex, -1));
    if (correctIndex < 0 || correctIndex >= options.length) {
      return { ok: false, error: `Question ${i + 1}: correctIndex out of range` };
    }
    let optionsAr: string[] | null = null;
    if (Array.isArray(q.optionsAr) && q.optionsAr.length) {
      const ar = q.optionsAr.map((o) => String(o).trim());
      if (ar.length !== options.length || ar.some((o) => !o)) {
        return {
          ok: false,
          error: `Question ${i + 1}: optionsAr must match options length with non-empty values`,
        };
      }
      optionsAr = ar;
    }
    normalizedQs.push({
      orderIndex: i,
      promptEn,
      promptAr: q.promptAr ? String(q.promptAr).trim() : null,
      optionsJson: serializeQuestionOptions(options, optionsAr),
      correctIndex,
    });
  }

  const standardPrice = asNum(raw.standardPrice, RULES.standardPrice);
  const standardVoucherValue = asNum(raw.standardVoucherValue, RULES.standardVoucherValue);
  if (standardPrice <= 0 || standardVoucherValue <= 0) {
    return { ok: false, error: "Price and voucher value must be positive" };
  }

  const maxPurchasesPerUser = Math.round(
    asNum(raw.maxPurchasesPerUser, RULES.maxPurchasesPerCampaign),
  );
  if (maxPurchasesPerUser < 1 || maxPurchasesPerUser > RULES.maxPurchasesPerCampaign) {
    return {
      ok: false,
      error: `maxPurchasesPerUser must be 1–${RULES.maxPurchasesPerCampaign}`,
    };
  }

  const timerSeconds = Math.round(asNum(raw.timerSeconds, RULES.challengeSeconds));
  if (timerSeconds < 10 || timerSeconds > 600) {
    return { ok: false, error: "timerSeconds must be between 10 and 600" };
  }

  const status = String(raw.status || "Draft");
  if (!STATUSES.has(status)) return { ok: false, error: `Invalid status: ${status}` };

  let gameplayDeadline: Date | null = null;
  let purchaseCutoff: Date | null = null;
  if (raw.gameplayDeadline) {
    gameplayDeadline = new Date(raw.gameplayDeadline);
    if (Number.isNaN(gameplayDeadline.getTime())) {
      return { ok: false, error: "Invalid gameplayDeadline" };
    }
    purchaseCutoff = new Date(
      gameplayDeadline.getTime() - RULES.purchaseCutoffMinutesBeforeDeadline * 60_000,
    );
  }

  return {
    ok: true,
    data: {
      slug,
      name,
      nameAr: raw.nameAr ? String(raw.nameAr).trim() : null,
      tagline: raw.tagline ? String(raw.tagline).trim() : null,
      taglineAr: raw.taglineAr ? String(raw.taglineAr).trim() : null,
      description: raw.description ? String(raw.description).trim() : null,
      descriptionAr: raw.descriptionAr ? String(raw.descriptionAr).trim() : null,
      status,
      standardPrice,
      standardVoucherValue,
      maxPurchasesPerUser,
      questionCount,
      timerSeconds,
      gameplayDeadline,
      purchaseCutoff,
      brandColor: raw.brandColor ? String(raw.brandColor) : "#E11D48",
      heroImageUrl: raw.heroImageUrl ? String(raw.heroImageUrl) : "/prizes/phone.svg",
      cardImageUrl: raw.cardImageUrl ? String(raw.cardImageUrl) : "/prizes/phone.svg",
      rulesText: raw.rulesText ? String(raw.rulesText) : null,
      rulesTextAr: raw.rulesTextAr ? String(raw.rulesTextAr) : null,
      voucherTerms: raw.voucherTerms ? String(raw.voucherTerms) : null,
      voucherTermsAr: raw.voucherTermsAr ? String(raw.voucherTermsAr) : null,
      merchantId: raw.merchantId ? String(raw.merchantId) : null,
      prize: {
        name: prizeName,
        nameAr: raw.prize.nameAr ? String(raw.prize.nameAr).trim() : null,
        description: raw.prize.description ? String(raw.prize.description).trim() : null,
        descriptionAr: raw.prize.descriptionAr ? String(raw.prize.descriptionAr).trim() : null,
        imageUrl: raw.prize.imageUrl ? String(raw.prize.imageUrl) : "/prizes/phone.svg",
        estimatedValue:
          raw.prize.estimatedValue != null ? asNum(raw.prize.estimatedValue, 0) : null,
        secured: raw.prize.secured !== false,
      },
      questions: normalizedQs,
      createStandardOffer: raw.createStandardOffer !== false,
    },
  };
}

export function emptyQuestionDraft(count = RULES.challengeQuestions): BuilderQuestionInput[] {
  return Array.from({ length: count }, () => ({
    promptEn: "",
    promptAr: "",
    options: ["", "", "", ""],
    optionsAr: ["", "", "", ""],
    correctIndex: 0,
  }));
}
