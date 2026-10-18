"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Section } from "@/components/ui";
import { useLocale, tr } from "@/lib/i18n";

type Question = {
  id: string;
  orderIndex: number;
  promptEn: string;
  promptAr?: string | null;
  options: string[];
  optionsAr?: string[] | null;
};

export default function PlayPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const customer = JSON.parse(window.localStorage.getItem("smp-customer") || "null");
    if (!customer) {
      router.replace(`/campaigns/${params.slug}/identify`);
      return;
    }
    fetch(`/api/challenge?campaign=${params.slug}&customerId=${customer.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok || !d.attempt) {
          setError(d.error || t("noUnusedAttempt"));
          return;
        }
        setAttemptId(d.attempt.id);
        setQuestions(d.questions);
        setSecondsLeft(d.timerSeconds || 60);
      });
  }, [params.slug, router, t]);

  const submit = useCallback(async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    const payload = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }));
    for (const q of questions) {
      if (!(q.id in answers)) payload.push({ questionId: q.id, selectedIndex: -1 });
    }
    const res = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", attemptId, answers: payload }),
    }).then((r) => r.json());
    if (!res.ok) {
      setError(res.error || "Submit failed");
      setSubmitting(false);
      return;
    }
    window.localStorage.setItem("smp-last-result", JSON.stringify(res));
    router.push(`/campaigns/${params.slug}/result`);
  }, [answers, attemptId, params.slug, questions, router, submitting]);

  useEffect(() => {
    if (!started) return;
    if (secondsLeft <= 0) {
      void submit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [started, secondsLeft, submit]);

  async function start() {
    if (!attemptId) return;
    const res = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", attemptId }),
    }).then((r) => r.json());
    if (!res.ok) {
      setError(res.error || "Cannot start");
      return;
    }
    setStarted(true);
  }

  const q = questions[idx];
  const prompt = q ? tr(locale, q.promptEn, q.promptAr) : "";
  const options =
    q && locale === "ar" && q.optionsAr?.length === q.options.length ? q.optionsAr : q?.options || [];

  return (
    <Section title={t("playTitle")} subtitle={t("playSub")}>
      {error ? <p className="mb-4 text-rose-700">{error}</p> : null}
      {!started ? (
        <div className="rounded-3xl bg-white/80 p-6">
          <p className="text-sm text-slate-600">{t("playReady")}</p>
          <Button className="mt-4" onClick={start} disabled={!attemptId}>
            {t("startChallenge")}
          </Button>
        </div>
      ) : q ? (
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-300">
              Q{idx + 1}/{questions.length}
            </span>
            <span
              className={`font-display text-3xl ${secondsLeft <= 10 ? "text-rose-400" : "text-teal-300"}`}
              dir="ltr"
            >
              {secondsLeft}s
            </span>
          </div>
          <h2 className="mt-4 font-display text-2xl">{prompt}</h2>
          <div className="mt-6 grid gap-2">
            {options.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={`rounded-xl px-4 py-3 text-start text-sm font-semibold ${
                  answers[q.id] === i ? "bg-rose-500" : "bg-white/10 hover:bg-white/20"
                }`}
                onClick={() => {
                  setAnswers((a) => ({ ...a, [q.id]: i }));
                  if (idx < questions.length - 1) setIdx(idx + 1);
                  else void submit();
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
