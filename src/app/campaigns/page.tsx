import { listCampaigns } from "@/lib/campaigns";
import { CampaignsDirectoryView } from "@/components/CampaignsDirectoryView";

export const dynamic = "force-dynamic";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter =
    sp.filter === "active" || sp.filter === "upcoming" || sp.filter === "completed"
      ? sp.filter
      : undefined;
  const campaigns = await listCampaigns(filter);

  return (
    <CampaignsDirectoryView
      filter={filter}
      campaigns={campaigns.map((c) => ({
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
      }))}
    />
  );
}
