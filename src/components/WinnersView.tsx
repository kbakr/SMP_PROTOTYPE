"use client";

import Link from "next/link";
import { Badge, EmptyState, Section } from "@/components/ui";
import { egyptDate } from "@/lib/utils";
import { useLocale, tr } from "@/lib/i18n";

type WinnerRow = {
  id: string;
  maskedName: string;
  prizeName: string;
  isDemo: boolean;
  publishedAt?: string | null;
  campaign: { slug: string; name: string; nameAr?: string | null };
};

export function WinnersView({
  campaigns,
  winners,
  selectedSlug,
}: {
  campaigns: Array<{ id: string; slug: string; name: string; nameAr?: string | null }>;
  winners: WinnerRow[];
  selectedSlug?: string;
}) {
  const { locale, t } = useLocale();

  return (
    <Section title={t("winnersTitle")} subtitle={t("winnersPageSub")}>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/winners"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
            !selectedSlug ? "bg-slate-900 text-white" : "bg-white/80"
          }`}
        >
          {t("filterAll")}
        </Link>
        {campaigns.map((c) => (
          <Link
            key={c.id}
            href={`/winners?campaign=${c.slug}`}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              selectedSlug === c.slug ? "bg-slate-900 text-white" : "bg-white/80"
            }`}
          >
            {tr(locale, c.name, c.nameAr)}
          </Link>
        ))}
      </div>
      {winners.length === 0 ? (
        <EmptyState message={t("noWinners")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((w) => (
            <article key={w.id} className="rounded-3xl border border-white/60 bg-white/80 p-5">
              {w.isDemo ? <Badge tone="demo">{t("demoWinner")}</Badge> : <Badge tone="live">Verified</Badge>}
              <h3 className="mt-3 font-display text-2xl">{w.maskedName}</h3>
              <p className="text-slate-600">{w.prizeName}</p>
              <p className="mt-2 text-sm">
                <Link href={`/campaigns/${w.campaign.slug}`} className="font-semibold text-rose-700">
                  {tr(locale, w.campaign.name, w.campaign.nameAr)}
                </Link>
              </p>
              <p className="mt-1 text-xs text-slate-500">{egyptDate(w.publishedAt, locale)}</p>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
