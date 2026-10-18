import { prisma } from "@/lib/db";
import { WinnersView } from "@/components/WinnersView";

export const dynamic = "force-dynamic";

export default async function WinnersPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const sp = await searchParams;
  const campaigns = await prisma.campaign.findMany({
    where: { showWinners: true },
    orderBy: { homeSortOrder: "asc" },
  });

  const winners = await prisma.winner.findMany({
    where: {
      verified: true,
      publicityConsent: true,
      ...(sp.campaign ? { campaign: { slug: sp.campaign } } : {}),
      campaign: { showWinners: true },
    },
    include: { campaign: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <WinnersView
      selectedSlug={sp.campaign}
      campaigns={campaigns.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        nameAr: c.nameAr,
      }))}
      winners={winners.map((w) => ({
        id: w.id,
        maskedName: w.maskedName,
        prizeName: w.prizeName,
        isDemo: w.isDemo,
        publishedAt: w.publishedAt?.toISOString() ?? null,
        campaign: {
          slug: w.campaign.slug,
          name: w.campaign.name,
          nameAr: w.campaign.nameAr,
        },
      }))}
    />
  );
}
