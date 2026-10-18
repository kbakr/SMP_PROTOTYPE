import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LeaderboardView } from "@/components/LeaderboardView";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) notFound();

  const rows = campaign.showLeaderboard
    ? await prisma.leaderboardResult.findMany({
        where: { campaignId: campaign.id },
        orderBy: { rank: "asc" },
        take: 100,
      })
    : [];

  return (
    <LeaderboardView
      slug={slug}
      name={campaign.name}
      nameAr={campaign.nameAr}
      hidden={!campaign.showLeaderboard}
      rows={rows.map((r) => ({
        id: r.id,
        rank: r.rank,
        displayName: r.displayName,
        score: r.score,
        timeMs: r.timeMs,
      }))}
    />
  );
}
