"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Section } from "@/components/ui";
import { RULES } from "@/lib/business-rules";
import {
  emptyQuestionDraft,
  type BuilderCampaignInput,
  type BuilderQuestionInput,
} from "@/lib/campaign-builder";
import { parseQuestionOptions } from "@/lib/question-options";

type Merchant = { id: string; name: string; nameAr?: string | null };

type InitialCampaign = {
  id?: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  tagline?: string | null;
  taglineAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  status: string;
  standardPrice: number;
  standardVoucherValue: number;
  maxPurchasesPerUser: number;
  questionCount: number;
  timerSeconds: number;
  gameplayDeadline?: string | Date | null;
  brandColor?: string | null;
  heroImageUrl?: string | null;
  cardImageUrl?: string | null;
  rulesText?: string | null;
  rulesTextAr?: string | null;
  voucherTerms?: string | null;
  voucherTermsAr?: string | null;
  merchantId?: string | null;
  prize?: {
    name: string;
    nameAr?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    imageUrl?: string | null;
    estimatedValue?: number | null;
    secured?: boolean;
  } | null;
  questions?: Array<{
    promptEn: string;
    promptAr?: string | null;
    optionsJson: string;
    correctIndex: number;
  }>;
};

function parseQs(c?: InitialCampaign): BuilderQuestionInput[] {
  if (!c?.questions?.length) return emptyQuestionDraft(RULES.challengeQuestions);
  return c.questions.map((q) => {
    const parsed = parseQuestionOptions(q.optionsJson);
    const options = parsed.options;
    const optionsAr = parsed.optionsAr || options.map(() => "");
    return {
      promptEn: q.promptEn,
      promptAr: q.promptAr || "",
      options: [...options, "", "", "", ""].slice(0, Math.max(4, options.length)),
      optionsAr: [...optionsAr, "", "", "", ""].slice(0, Math.max(4, options.length)),
      correctIndex: q.correctIndex,
    };
  });
}

function toLocalInput(d?: string | Date | null): string {
  if (!d) {
    const future = new Date(Date.now() + 21 * 24 * 60 * 60_000);
    return future.toISOString().slice(0, 16);
  }
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CampaignBuilderForm({
  merchants,
  initial,
}: {
  merchants: Merchant[];
  initial?: InitialCampaign;
}) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [slug, setSlug] = useState(initial?.slug || "");
  const [name, setName] = useState(initial?.name || "");
  const [nameAr, setNameAr] = useState(initial?.nameAr || "");
  const [tagline, setTagline] = useState(initial?.tagline || "");
  const [taglineAr, setTaglineAr] = useState(initial?.taglineAr || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [descriptionAr, setDescriptionAr] = useState(initial?.descriptionAr || "");
  const [status, setStatus] = useState(initial?.status || "Draft");
  const [standardPrice, setStandardPrice] = useState(initial?.standardPrice ?? RULES.standardPrice);
  const [standardVoucherValue, setStandardVoucherValue] = useState(
    initial?.standardVoucherValue ?? RULES.standardVoucherValue,
  );
  const [maxPurchasesPerUser, setMaxPurchases] = useState(
    initial?.maxPurchasesPerUser ?? RULES.maxPurchasesPerCampaign,
  );
  const [timerSeconds, setTimerSeconds] = useState(
    initial?.timerSeconds ?? RULES.challengeSeconds,
  );
  const [gameplayDeadline, setGameplayDeadline] = useState(toLocalInput(initial?.gameplayDeadline));
  const [brandColor, setBrandColor] = useState(initial?.brandColor || "#E11D48");
  const [merchantId, setMerchantId] = useState(initial?.merchantId || merchants[0]?.id || "");
  const [rulesText, setRulesText] = useState(initial?.rulesText || "");
  const [rulesTextAr, setRulesTextAr] = useState(initial?.rulesTextAr || "");
  const [voucherTerms, setVoucherTerms] = useState(initial?.voucherTerms || "");
  const [voucherTermsAr, setVoucherTermsAr] = useState(initial?.voucherTermsAr || "");
  const [prizeName, setPrizeName] = useState(initial?.prize?.name || "");
  const [prizeNameAr, setPrizeNameAr] = useState(initial?.prize?.nameAr || "");
  const [prizeDesc, setPrizeDesc] = useState(initial?.prize?.description || "");
  const [prizeDescAr, setPrizeDescAr] = useState(initial?.prize?.descriptionAr || "");
  const [prizeImage, setPrizeImage] = useState(initial?.prize?.imageUrl || "/prizes/phone.svg");
  const [questions, setQuestions] = useState<BuilderQuestionInput[]>(() => parseQs(initial));

  const questionCount = questions.length;

  const payload: BuilderCampaignInput = useMemo(
    () => ({
      slug,
      name,
      nameAr: nameAr || null,
      tagline: tagline || null,
      taglineAr: taglineAr || null,
      description: description || null,
      descriptionAr: descriptionAr || null,
      status,
      standardPrice,
      standardVoucherValue,
      maxPurchasesPerUser,
      questionCount,
      timerSeconds,
      gameplayDeadline: gameplayDeadline ? new Date(gameplayDeadline).toISOString() : null,
      brandColor,
      heroImageUrl: prizeImage,
      cardImageUrl: prizeImage,
      rulesText: rulesText || null,
      rulesTextAr: rulesTextAr || null,
      voucherTerms: voucherTerms || null,
      voucherTermsAr: voucherTermsAr || null,
      merchantId: merchantId || null,
      createStandardOffer: true,
      prize: {
        name: prizeName,
        nameAr: prizeNameAr || null,
        description: prizeDesc || null,
        descriptionAr: prizeDescAr || null,
        imageUrl: prizeImage,
        secured: true,
      },
      questions: questions.map((q) => {
        const pairs = q.options
          .map((opt, i) => ({
            en: opt.trim(),
            ar: (q.optionsAr?.[i] || "").trim(),
          }))
          .filter((p) => p.en);
        const correctEn = (q.options[q.correctIndex] || "").trim();
        const correctIndex = Math.max(
          0,
          pairs.findIndex((p) => p.en === correctEn),
        );
        const hasAr = pairs.some((p) => p.ar);
        return {
          promptEn: q.promptEn,
          promptAr: q.promptAr || null,
          options: pairs.map((p) => p.en),
          optionsAr: hasAr ? pairs.map((p) => p.ar || p.en) : null,
          correctIndex,
        };
      }),
    }),
    [
      slug,
      name,
      nameAr,
      tagline,
      taglineAr,
      description,
      descriptionAr,
      status,
      standardPrice,
      standardVoucherValue,
      maxPurchasesPerUser,
      questionCount,
      timerSeconds,
      gameplayDeadline,
      brandColor,
      merchantId,
      rulesText,
      rulesTextAr,
      voucherTerms,
      voucherTermsAr,
      prizeName,
      prizeNameAr,
      prizeDesc,
      prizeDescAr,
      prizeImage,
      questions,
    ],
  );

  async function save() {
    setSaving(true);
    setMsg("Saving…");
    const res = await fetch("/api/admin/campaigns", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { id: initial!.id, ...payload } : payload),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.ok) {
      setMsg(res.error || "Save failed");
      return;
    }
    setMsg("Saved");
    router.push(`/admin/campaigns/${res.campaign.id}`);
    router.refresh();
  }

  function updateQuestion(i: number, patch: Partial<BuilderQuestionInput>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, value: string, ar = false) {
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== qi) return q;
        if (ar) {
          const optionsAr = [...(q.optionsAr || q.options.map(() => ""))];
          optionsAr[oi] = value;
          return { ...q, optionsAr };
        }
        const options = [...q.options];
        options[oi] = value;
        return { ...q, options };
      }),
    );
  }

  return (
    <Section
      title={editing ? `Edit campaign` : "Create campaign"}
      subtitle={`Demo builder · commercial defaults ${RULES.standardPrice}/${RULES.standardVoucherValue}, max ${RULES.maxPurchasesPerCampaign}, ${RULES.challengeQuestions}Q / ${RULES.challengeSeconds}s`}
      action={
        <a href="/admin" className="text-sm font-bold text-rose-700">
          ← Visibility
        </a>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Create campaign"}
        </Button>
        {editing ? (
          <a
            href={`/campaigns/${slug}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            Preview portal
          </a>
        ) : null}
        {msg ? <span className="self-center text-sm text-slate-600">{msg}</span> : null}
      </div>

      <div className="space-y-8">
        <fieldset className="rounded-3xl border border-white/60 bg-white/80 p-5">
          <legend className="px-2 font-display text-lg">Identity & copy</legend>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Slug
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                dir="ltr"
                placeholder="my-campaign"
              />
            </label>
            <label className="text-sm font-semibold">
              Status
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {["Draft", "Scheduled", "Live", "Paused", "Closed", "Archived"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Name (EN)
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              الاسم (AR)
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                dir="rtl"
              />
            </label>
            <label className="text-sm font-semibold">
              Tagline (EN)
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              الشعار (AR)
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={taglineAr}
                onChange={(e) => setTaglineAr(e.target.value)}
                dir="rtl"
              />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Description (EN)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              الوصف (AR)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={2}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                dir="rtl"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-3xl border border-white/60 bg-white/80 p-5">
          <legend className="px-2 font-display text-lg">Commercial & schedule</legend>
          <p className="mb-3 text-xs text-slate-500">
            Customer pays for voucher + attempt. Prize is competed for — never purchased. Max{" "}
            {RULES.maxPurchasesPerCampaign} purchases/attempts.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-semibold">
              You pay (EGP)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={standardPrice}
                onChange={(e) => setStandardPrice(Number(e.target.value))}
              />
            </label>
            <label className="text-sm font-semibold">
              Voucher value (EGP)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={standardVoucherValue}
                onChange={(e) => setStandardVoucherValue(Number(e.target.value))}
              />
            </label>
            <label className="text-sm font-semibold">
              Max purchases
              <input
                type="number"
                min={1}
                max={RULES.maxPurchasesPerCampaign}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={maxPurchasesPerUser}
                onChange={(e) => setMaxPurchases(Number(e.target.value))}
              />
            </label>
            <label className="text-sm font-semibold">
              Timer (seconds)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
              />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Gameplay deadline
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={gameplayDeadline}
                onChange={(e) => setGameplayDeadline(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Brand color
              <input
                type="color"
                className="mt-1 h-10 w-full rounded-xl border px-2"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Merchant
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-3xl border border-white/60 bg-white/80 p-5">
          <legend className="px-2 font-display text-lg">Prize</legend>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Prize name (EN)
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              اسم الجائزة (AR)
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={prizeNameAr}
                onChange={(e) => setPrizeNameAr(e.target.value)}
                dir="rtl"
              />
            </label>
            <label className="text-sm font-semibold">
              Description (EN)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={2}
                value={prizeDesc}
                onChange={(e) => setPrizeDesc(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              الوصف (AR)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={2}
                value={prizeDescAr}
                onChange={(e) => setPrizeDescAr(e.target.value)}
                dir="rtl"
              />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Image URL
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={prizeImage}
                onChange={(e) => setPrizeImage(e.target.value)}
                dir="ltr"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-3xl border border-white/60 bg-white/80 p-5">
          <legend className="px-2 font-display text-lg">Rules & voucher terms</legend>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Rules (EN)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={3}
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              القواعد (AR)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={3}
                value={rulesTextAr}
                onChange={(e) => setRulesTextAr(e.target.value)}
                dir="rtl"
              />
            </label>
            <label className="text-sm font-semibold">
              Voucher terms (EN)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={2}
                value={voucherTerms}
                onChange={(e) => setVoucherTerms(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              شروط القسيمة (AR)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={2}
                value={voucherTermsAr}
                onChange={(e) => setVoucherTermsAr(e.target.value)}
                dir="rtl"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-3xl border border-white/60 bg-white/80 p-5">
          <legend className="px-2 font-display text-lg">
            Questions ({questionCount} · correct index is 0-based)
          </legend>
          <div className="space-y-6">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 font-semibold text-rose-700">Q{qi + 1}</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Prompt EN
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={q.promptEn}
                      onChange={(e) => updateQuestion(qi, { promptEn: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    السؤال AR
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={q.promptAr || ""}
                      onChange={(e) => updateQuestion(qi, { promptAr: e.target.value })}
                      dir="rtl"
                    />
                  </label>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="grid gap-1 rounded-xl bg-white p-2">
                      <label className="text-xs font-semibold">
                        Option {oi + 1} EN
                        <input
                          className="mt-1 w-full rounded-lg border px-2 py-1.5 text-sm"
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                        />
                      </label>
                      <label className="text-xs font-semibold">
                        خيار {oi + 1} AR
                        <input
                          className="mt-1 w-full rounded-lg border px-2 py-1.5 text-sm"
                          value={q.optionsAr?.[oi] || ""}
                          onChange={(e) => updateOption(qi, oi, e.target.value, true)}
                          dir="rtl"
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <label className="mt-3 block text-sm font-semibold">
                  Correct option
                  <select
                    className="mt-1 rounded-xl border px-3 py-2"
                    value={q.correctIndex}
                    onChange={(e) =>
                      updateQuestion(qi, { correctIndex: Number(e.target.value) })
                    }
                  >
                    {q.options.map((opt, oi) => (
                      <option key={oi} value={oi}>
                        {oi + 1}: {opt || "(empty)"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </Section>
  );
}
