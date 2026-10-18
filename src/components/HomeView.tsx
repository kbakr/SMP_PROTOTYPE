"use client";

import Link from "next/link";
import { CampaignCard, type CampaignCardData } from "@/components/CampaignCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Badge, EmptyState, Section } from "@/components/ui";
import { egyptDate, formatEGP } from "@/lib/utils";
import { useLocale, tr } from "@/lib/i18n";

type WinnerRow = {
  id: string;
  maskedName: string;
  prizeName: string;
  publishedAt?: string | Date | null;
  campaign: { name: string; nameAr?: string | null };
};

type LbPreview = {
  campaign: CampaignCardData & { id: string };
  rows: Array<{ id: string; rank: number | null; displayName: string; score: number; timeMs: number }>;
};

export type HomeViewData = {
  modules: { key: string; enabled: boolean }[];
  featured: CampaignCardData[];
  active: (CampaignCardData & { id: string })[];
  upcoming: (CampaignCardData & { id: string })[];
  winners: WinnerRow[];
  leaderboardPreviews: LbPreview[];
};

function moduleEnabled(modules: { key: string; enabled: boolean }[], key: string) {
  const m = modules.find((x) => x.key === key);
  return m ? m.enabled : true;
}

export function HomeView({ data }: { data: HomeViewData }) {
  const { locale, t } = useLocale();
  const { modules, featured, active, upcoming, winners, leaderboardPreviews } = data;

  return (
    <div>
      {moduleEnabled(modules, "hero") ? (
        <HeroCarousel campaigns={featured.length ? featured : active} />
      ) : null}

      {moduleEnabled(modules, "how_it_works") ? (
        <Section title={t("howItWorks")} subtitle={t("howItWorksSub")}>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: t("step1"), d: t("step1Body") },
              { n: "02", t: t("step2"), d: t("step2Body") },
              { n: "03", t: t("step3"), d: t("step3Body") },
              { n: "04", t: t("step4"), d: t("step4Body") },
            ].map((s) => (
              <li key={s.n} className="rounded-3xl border border-white/60 bg-white/70 p-5">
                <div className="font-display text-3xl text-rose-600">{s.n}</div>
                <h3 className="mt-2 font-display text-xl">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {moduleEnabled(modules, "active") ? (
        <Section
          title={t("activeCampaigns")}
          subtitle={t("activeSub")}
          action={
            <Link href="/campaigns" className="text-sm font-bold text-rose-700">
              {t("viewAll")} →
            </Link>
          }
        >
          {active.length === 0 ? (
            <EmptyState message={t("noLiveHome")} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {moduleEnabled(modules, "upcoming") ? (
        <Section title={t("upcoming")} subtitle={t("upcomingSub")}>
          {upcoming.length === 0 ? (
            <EmptyState message={t("noUpcoming")} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((c) => (
                <CampaignCard key={c.id} campaign={c} ctaLabel={t("notifyMe")} />
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {moduleEnabled(modules, "winners") ? (
        <Section title={t("recentWinners")} subtitle={t("winnersSub")}>
          {winners.length === 0 ? (
            <EmptyState message={t("noWinners")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {winners.map((w) => (
                <div key={w.id} className="rounded-3xl border border-white/60 bg-white/75 p-5">
                  <Badge tone="demo">{t("demoWinner")}</Badge>
                  <div className="mt-3 font-display text-2xl">{w.maskedName}</div>
                  <p className="text-sm text-slate-600">
                    {w.prizeName} · {tr(locale, w.campaign.name, w.campaign.nameAr)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{egyptDate(w.publishedAt, locale)}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {moduleEnabled(modules, "leaderboards") ? (
        <Section title={t("leaderboards")} subtitle={t("leaderboardsSub")}>
          {leaderboardPreviews.length === 0 ? (
            <EmptyState message={t("noLeaderboards")} />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {leaderboardPreviews.map(({ campaign, rows }) => (
                <div key={campaign.id} className="rounded-3xl border border-white/60 bg-white/75 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl">
                        {tr(locale, campaign.name, campaign.nameAr)}
                      </h3>
                      <Badge tone="live">{t("provisional")}</Badge>
                    </div>
                    <Link
                      href={`/campaigns/${campaign.slug}/leaderboard`}
                      className="text-sm font-bold text-teal-700"
                    >
                      {t("fullBoard")}
                    </Link>
                  </div>
                  <ol className="mt-4 space-y-2">
                    {rows.length === 0 ? (
                      <li className="text-sm text-slate-500">{t("noRankedYet")}</li>
                    ) : (
                      rows.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span>
                            <strong>#{r.rank}</strong> {r.displayName}
                          </span>
                          <span className="text-slate-600">
                            {r.score}/5 · {(r.timeMs / 1000).toFixed(2)}s
                          </span>
                        </li>
                      ))
                    )}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {moduleEnabled(modules, "trust") ? (
        <Section title={t("trustTitle")}>
          <div className="overflow-hidden rounded-3xl bg-slate-950 p-8 text-white">
            <h3 className="font-display text-3xl">{t("trustHeadline")}</h3>
            <p className="mt-3 max-w-3xl text-slate-300">{t("trustBody")}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1">{t("ageBadge")}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{t("maxAttemptsBadge")}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {t("exampleStandard")}: {formatEGP(500, locale)} → {formatEGP(500, locale)}{" "}
                {t("voucher")}
              </span>
            </div>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
