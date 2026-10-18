"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Section } from "@/components/ui";

type Question = {
  id: string;
  orderIndex: number;
  promptEn: string;
  options: string[];
};

export default function PlayPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
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
          setError(d.error || "No unused attempt. Purchase first.");
          return;
        }
        setAttemptId(d.attempt.id);
        setQuestions(d.questions);
        setSecondsLeft(d.timerSeconds || 60);
      });
  }, [params.slug, router]);

  const submit = useCallback(async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    const payload = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }));
    // fill unanswered as -1
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
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
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

  return (
    <Section
      title="Skill challenge"
      subtitle="5 questions · one continuous timer · answers final · no live correctness feedback"
    >
      {error ? <p className="mb-4 text-rose-700">{error}</p> : null}
      {!started ? (
        <div className="rounded-3xl bg-white/80 p-6">
          <p className="text-sm text-slate-600">
            Timer starts on the server when you begin. Leaving the page does not pause a started attempt.
          </p>
          <Button className="mt-4" onClick={start} disabled={!attemptId}>
            Start 60-second challenge
          </Button>
        </div>
      ) : q ? (
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-300">
              Q{idx + 1}/{questions.length}
            </span>
            <span className={`font-display text-3xl ${secondsLeft <= 10 ? "text-rose-400" : "text-teal-300"}`}>
              {secondsLeft}s
            </span>
          </div>
          <h2 className="mt-4 font-display text-2xl">{q.promptEn}</h2>
          <div className="mt-6 grid gap-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={`rounded-xl px-4 py-3 text-left text-sm font-semibold ${
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
