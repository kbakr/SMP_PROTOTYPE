"use client";

import Image from "next/image";
import Link from "next/link";
import { formatEGP, egyptDate } from "@/lib/utils";
import { useLocale, tr } from "@/lib/i18n";
import { Badge, LinkButton } from "./ui";

export type CampaignCardData = {
  slug: string;
  name: string;
  nameAr?: string | null;
  status: string;
  standardPrice: number;
  standardVoucherValue: number;
  brandColor?: string | null;
  cardImageUrl?: string | null;
  heroImageUrl?: string | null;
  gameplayDeadline?: Date | string | null;
  prize?: { name: string; nameAr?: string | null; imageUrl?: string | null } | null;
  merchant?: { name: string; nameAr?: string | null } | null;
};

export function CampaignCard({
  campaign,
  ctaLabel,
}: {
  campaign: CampaignCardData;
  ctaLabel?: string;
}) {
  const { locale, t } = useLocale();
  const prizeName = tr(locale, campaign.prize?.name || "", campaign.prize?.nameAr);
  const name = tr(locale, campaign.name, campaign.nameAr);
  const merchantName = tr(locale, campaign.merchant?.name || "", campaign.merchant?.nameAr);
  const tone =
    campaign.status === "Live" ? "live" : campaign.status === "Scheduled" ? "soon" : "closed";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 shadow-[0_20px_50px_-30px_rgba(225,29,72,0.45)] transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(13,148,136,0.45)]">
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: campaign.brandColor || "#E11D48" }}
      />
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <Image
          src={campaign.cardImageUrl || campaign.prize?.imageUrl || "/prizes/phone.svg"}
          alt={prizeName || name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <div className="absolute start-3 top-3">
          <Badge tone={tone}>{campaign.status}</Badge>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-display text-xl text-slate-900">{name}</h3>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {t("prizeLabel")}: <span className="text-slate-900">{prizeName || "—"}</span>
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-rose-50 px-3 py-2">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-rose-700">{t("price")}</dt>
            <dd className="font-semibold text-slate-900">{formatEGP(campaign.standardPrice, locale)}</dd>
          </div>
          <div className="rounded-xl bg-teal-50 px-3 py-2">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-teal-700">{t("voucher")}</dt>
            <dd className="font-semibold text-slate-900">
              {formatEGP(campaign.standardVoucherValue, locale)}
              {merchantName ? (
                <span className="block text-[11px] font-medium text-teal-800">{merchantName}</span>
              ) : null}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-slate-500">
          {t("deadline")}: {egyptDate(campaign.gameplayDeadline, locale)} · {t("skillWinNote")}
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={`/campaigns/${campaign.slug}`} className="flex-1">
            {ctaLabel || t("enterNow")}
          </LinkButton>
          <Link
            href={`/campaigns/${campaign.slug}/leaderboard`}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            {t("leaderboardLink")}
          </Link>
        </div>
      </div>
    </article>
  );
}
