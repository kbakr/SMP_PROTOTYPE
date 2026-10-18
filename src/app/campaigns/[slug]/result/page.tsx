"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkButton, Section } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

export default function ResultPage() {
  const params = useParams<{ slug: string }>();
  const { t } = useLocale();
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
    <Section title={t("resultTitle")} subtitle={t("resultSub")}>
      <div className="mx-auto max-w-md rounded-3xl bg-white/85 p-8 text-center shadow-lg">
        <div className="text-sm font-semibold text-slate-500">{t("yourScore")}</div>
        <div className="font-display text-5xl text-rose-600" dir="ltr">
          {result?.score ?? "—"}/5
        </div>
        <p className="mt-2 text-slate-600">
          {t("yourTime")}{" "}
          <span dir="ltr">{(result?.timeMs ? result.timeMs / 1000 : 0).toFixed(2)}s</span>
        </p>
        <p className="mt-4 font-display text-3xl">
          {t("yourRank")} #{result?.rank ?? "—"}
        </p>
        <p className="mt-2 text-xs text-slate-500">{t("provisionalUntil")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton href={`/campaigns/${params.slug}/leaderboard`}>{t("leaderboardLink")}</LinkButton>
          <LinkButton href={`/campaigns/${params.slug}/offer?offer=REPLAY350`} variant="secondary">
            {t("nbaReplay")}
          </LinkButton>
          <LinkButton href={`/campaigns/${params.slug}`} variant="ghost">
            {t("backToCampaign")}
          </LinkButton>
        </div>
      </div>
    </Section>
  );
}
