"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkButton, Section } from "@/components/ui";

export default function ResultPage() {
  const params = useParams<{ slug: string }>();
  const [result, setResult] = useState<{
    score?: number;
    timeMs?: number;
    rank?: number | null;
  } | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("smp-last-result");
    if (raw) setResult(JSON.parse(raw));
  }, []);

  return (
    <Section title="Your result" subtitle="Ranked on this campaign's leaderboard only">
      <div className="mx-auto max-w-md rounded-3xl bg-white/85 p-8 text-center shadow-lg">
        <div className="font-display text-5xl text-rose-600">{result?.score ?? "—"}/5</div>
        <p className="mt-2 text-slate-600">
          Time {(result?.timeMs ? result.timeMs / 1000 : 0).toFixed(2)}s (server-authoritative)
        </p>
        <p className="mt-4 font-display text-3xl">
          Rank #{result?.rank ?? "—"}
        </p>
        <p className="mt-2 text-xs text-slate-500">Provisional until winner verification</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton href={`/campaigns/${params.slug}/leaderboard`}>Leaderboard</LinkButton>
          <LinkButton href={`/campaigns/${params.slug}/offer?offer=REPLAY350`} variant="secondary">
            Replay offer
          </LinkButton>
          <LinkButton href="/account" variant="ghost">
            My Account
          </LinkButton>
        </div>
      </div>
    </Section>
  );
}
