"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge, LinkButton, Section } from "@/components/ui";
import { egyptDate, formatEGP } from "@/lib/utils";
import { useLocale, tr } from "@/lib/i18n";

export type CampaignDetailData = {
  slug: string;
  name: string;
  nameAr?: string | null;
  tagline?: string | null;
  taglineAr?: string | null;
  status: string;
  standardPrice: number;
  standardVoucherValue: number;
  maxPurchasesPerUser: number;
  questionCount: number;
  timerSeconds: number;
  gameplayDeadline?: string | null;
  purchaseCutoff?: string | null;
  heroImageUrl?: string | null;
  showInDirectory: boolean;
  showLeaderboard: boolean;
  showWinners: boolean;
  rulesText?: string | null;
  rulesTextAr?: string | null;
  voucherTerms?: string | null;
  voucherTermsAr?: string | null;
  prize?: {
    name: string;
    nameAr?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    imageUrl?: string | null;
  } | null;
  merchant?: { name: string; nameAr?: string | null } | null;
  winners: Array<{ id: string; maskedName: string; prizeName: string }>;
  top: Array<{ id: string; rank: number | null; displayName: string; score: number; timeMs: number }>;
  canPurchase: boolean;
  closed: boolean;
};

export function CampaignDetailView({ campaign }: { campaign: CampaignDetailData }) {
  const { locale, t } = useLocale();
  const name = tr(locale, campaign.name, campaign.nameAr);
  const tagline = tr(locale, campaign.tagline || "", campaign.taglineAr);
  const prizeName = tr(locale, campaign.prize?.name || "", campaign.prize?.nameAr);
  const prizeDesc = tr(locale, campaign.prize?.description || "", campaign.prize?.descriptionAr);
  const merchantName = tr(locale, campaign.merchant?.name || "", campaign.merchant?.nameAr);
  const rules = tr(locale, campaign.rulesText || "", campaign.rulesTextAr);
  const voucherTerms = tr(locale, campaign.voucherTerms || "", campaign.voucherTermsAr);
  const unavailable = !campaign.showInDirectory && campaign.status !== "Live";

  return (
    <div>
      <section className="relative min-h-[50vh] overflow-hidden">
        <Image
          src={campaign.heroImageUrl || campaign.prize?.imageUrl || "/prizes/phone.svg"}
          alt={prizeName || name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6">
          <Badge
            tone={
              campaign.status === "Live" ? "live" : campaign.status === "Scheduled" ? "soon" : "closed"
            }
          >
            {campaign.status}
          </Badge>
          <h1 className="mt-3 font-display text-4xl text-white sm:text-6xl">{name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-white/85">{tagline}</p>
        </div>
      </section>

      {unavailable || campaign.closed ? (
        <Section title={t("campaignUnavailable")}>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            {t("campaignUnavailableBody")}
          </div>
        </Section>
      ) : null}

      <Section title={t("prizePriceVoucher")}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/80 p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("prize")}</div>
            <div className="mt-2 font-display text-2xl">{prizeName}</div>
            <p className="mt-2 text-sm text-slate-600">{prizeDesc}</p>
            <p className="mt-3 text-xs font-semibold text-rose-700">{t("competedNotPurchased")}</p>
          </div>
          <div className="rounded-3xl bg-rose-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-rose-700">{t("price")}</div>
            <div className="mt-2 font-display text-3xl">
              {formatEGP(campaign.standardPrice, locale)}
            </div>
            <p className="mt-2 text-sm text-slate-600">{t("offersMayDiffer")}</p>
          </div>
          <div className="rounded-3xl bg-teal-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-teal-700">{t("voucher")}</div>
            <div className="mt-2 font-display text-3xl">
              {formatEGP(campaign.standardVoucherValue, locale)}
            </div>
            <p className="mt-2 text-sm text-slate-600">{merchantName}</p>
            <p className="mt-2 text-xs text-slate-500">{voucherTerms}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {campaign.canPurchase ? (
            <LinkButton href={`/campaigns/${campaign.slug}/identify`}>{t("enterNow")}</LinkButton>
          ) : (
            <span className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">
              {t("purchasesClosed")}
            </span>
          )}
          {campaign.status === "Scheduled" ? (
            <LinkButton href={`/campaigns/${campaign.slug}/notify`} variant="secondary">
              {t("notifyMe")}
            </LinkButton>
          ) : null}
          {campaign.showLeaderboard ? (
            <LinkButton href={`/campaigns/${campaign.slug}/leaderboard`} variant="ghost">
              {t("leaderboardLink")}
            </LinkButton>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          {t("deadline")}: {egyptDate(campaign.gameplayDeadline, locale)} · {t("purchaseCutoff")}:{" "}
          {egyptDate(campaign.purchaseCutoff, locale)} · {t("maxAttempts")}{" "}
          {campaign.maxPurchasesPerUser} · {campaign.questionCount}Q / {campaign.timerSeconds}s
        </p>
      </Section>

      <Section title={t("rules")}>
        <p className="max-w-3xl whitespace-pre-wrap text-slate-700">{rules}</p>
        <p className="mt-3 text-sm font-semibold text-slate-900">{t("skillNotLottery")}</p>
      </Section>

      {campaign.showLeaderboard ? (
        <Section title={`${name} — ${t("topRanks")}`} subtitle={t("provisionalUntil")}>
          <ol className="space-y-2">
            {campaign.top.map((r) => (
              <li key={r.id} className="flex justify-between rounded-xl bg-white/80 px-4 py-3 text-sm">
                <span>
                  #{r.rank} {r.displayName}
                </span>
                <span>
                  {r.score}/5 · {(r.timeMs / 1000).toFixed(2)}s
                </span>
              </li>
            ))}
          </ol>
          <Link
            href={`/campaigns/${campaign.slug}/leaderboard`}
            className="mt-4 inline-block text-sm font-bold text-teal-700"
          >
            {t("viewLeaderboard")} →
          </Link>
        </Section>
      ) : null}

      {campaign.showWinners && campaign.winners.length > 0 ? (
        <Section title={t("recentWinners")}>
          <div className="grid gap-3 sm:grid-cols-2">
            {campaign.winners.map((w) => (
              <div key={w.id} className="rounded-2xl bg-white/80 p-4">
                <Badge tone="demo">Demo</Badge>
                <div className="mt-2 font-display text-xl">{w.maskedName}</div>
                <div className="text-sm text-slate-600">{w.prizeName}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
