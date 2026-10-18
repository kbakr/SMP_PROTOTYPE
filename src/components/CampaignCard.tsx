import Image from "next/image";
import Link from "next/link";
import { formatEGP, egyptDate } from "@/lib/utils";
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
  merchant?: { name: string } | null;
};

export function CampaignCard({
  campaign,
  locale = "en",
  ctaLabel = "Enter now",
}: {
  campaign: CampaignCardData;
  locale?: string;
  ctaLabel?: string;
}) {
  const prizeName =
    locale === "ar" && campaign.prize?.nameAr ? campaign.prize.nameAr : campaign.prize?.name;
  const name = locale === "ar" && campaign.nameAr ? campaign.nameAr : campaign.name;
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
        <div className="absolute left-3 top-3">
          <Badge tone={tone}>{campaign.status}</Badge>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-display text-xl text-slate-900">{name}</h3>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Prize: <span className="text-slate-900">{prizeName || "—"}</span>
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-rose-50 px-3 py-2">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-rose-700">You pay</dt>
            <dd className="font-semibold text-slate-900">{formatEGP(campaign.standardPrice, locale)}</dd>
          </div>
          <div className="rounded-xl bg-teal-50 px-3 py-2">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-teal-700">Voucher</dt>
            <dd className="font-semibold text-slate-900">
              {formatEGP(campaign.standardVoucherValue, locale)}
              {campaign.merchant ? (
                <span className="block text-[11px] font-medium text-teal-800">{campaign.merchant.name}</span>
              ) : null}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-slate-500">
          Deadline: {egyptDate(campaign.gameplayDeadline, locale)} · Skill-based · Win not guaranteed
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={`/campaigns/${campaign.slug}`} className="flex-1">
            {ctaLabel}
          </LinkButton>
          <Link
            href={`/campaigns/${campaign.slug}/leaderboard`}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </article>
  );
}
