"use client";

import Link from "next/link";
import { Badge, Section } from "@/components/ui";
import { useLocale, tr } from "@/lib/i18n";

export function LeaderboardView({
  slug,
  name,
  nameAr,
  hidden,
  rows,
}: {
  slug: string;
  name: string;
  nameAr?: string | null;
  hidden: boolean;
  rows: Array<{ id: string; rank: number | null; displayName: string; score: number; timeMs: number }>;
}) {
  const { locale, t } = useLocale();
  const title = tr(locale, name, nameAr);

  if (hidden) {
    return (
      <Section title={t("lbTitle")}>
        <p className="text-slate-600">{t("campaignUnavailableBody")}</p>
        <Link href={`/campaigns/${slug}`} className="mt-4 inline-block font-bold text-rose-700">
          {t("backToCampaign")}
        </Link>
      </Section>
    );
  }

  return (
    <Section
      title={`${title} — ${t("lbTitle")}`}
      subtitle={t("lbSub")}
      action={<Badge tone="live">{t("provisional")}</Badge>}
    >
      <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80">
        <table className="w-full text-start text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">{t("yourScore")}</th>
              <th className="px-4 py-3">{t("yourTime")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-bold">#{r.rank}</td>
                <td className="px-4 py-3">{r.displayName}</td>
                <td className="px-4 py-3" dir="ltr">
                  {r.score}/5
                </td>
                <td className="px-4 py-3" dir="ltr">
                  {(r.timeMs / 1000).toFixed(2)}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="p-6 text-center text-slate-500">{t("noRankedYet")}</p>
        ) : null}
      </div>
      <Link href={`/campaigns/${slug}`} className="mt-6 inline-block text-sm font-bold text-rose-700">
        {t("backToCampaign")}
      </Link>
    </Section>
  );
}
