import { getHomepageData } from "@/lib/campaigns";
import { HomeView, type HomeViewData } from "@/components/HomeView";

export const dynamic = "force-dynamic";

function serializeCampaign(c: {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  status: string;
  standardPrice: number;
  standardVoucherValue: number;
  brandColor?: string | null;
  cardImageUrl?: string | null;
  heroImageUrl?: string | null;
  gameplayDeadline?: Date | null;
  prize?: {
    name: string;
    nameAr?: string | null;
    imageUrl?: string | null;
  } | null;
  merchant?: { name: string; nameAr?: string | null } | null;
}) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    nameAr: c.nameAr,
    status: c.status,
    standardPrice: c.standardPrice,
    standardVoucherValue: c.standardVoucherValue,
    brandColor: c.brandColor,
    cardImageUrl: c.cardImageUrl,
    heroImageUrl: c.heroImageUrl,
    gameplayDeadline: c.gameplayDeadline?.toISOString() ?? null,
    prize: c.prize
      ? { name: c.prize.name, nameAr: c.prize.nameAr, imageUrl: c.prize.imageUrl }
      : null,
    merchant: c.merchant
      ? { name: c.merchant.name, nameAr: c.merchant.nameAr }
      : null,
  };
}

export default async function HomePage() {
  const data = await getHomepageData();
  const view: HomeViewData = {
    modules: data.modules.map((m) => ({ key: m.key, enabled: m.enabled })),
    featured: data.featured.map(serializeCampaign),
    active: data.active.map(serializeCampaign),
    upcoming: data.upcoming.map(serializeCampaign),
    winners: data.winners.map((w) => ({
      id: w.id,
      maskedName: w.maskedName,
      prizeName: w.prizeName,
      publishedAt: w.publishedAt?.toISOString() ?? null,
      campaign: { name: w.campaign.name, nameAr: w.campaign.nameAr },
    })),
    leaderboardPreviews: data.leaderboardPreviews.map(({ campaign, rows }) => ({
      campaign: serializeCampaign(campaign),
      rows: rows.map((r) => ({
        id: r.id,
        rank: r.rank,
        displayName: r.displayName,
        score: r.score,
        timeMs: r.timeMs,
      })),
    })),
  };

  return <HomeView data={view} />;
}
