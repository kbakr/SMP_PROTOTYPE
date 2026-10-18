import { notFound } from "next/navigation";
import { getCampaignBySlug, publicCampaignState } from "@/lib/campaigns";
import { CampaignDetailView } from "@/components/CampaignDetailView";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) notFound();

  const state = publicCampaignState(campaign);
  const top = await prisma.leaderboardResult.findMany({
    where: { campaignId: campaign.id },
    orderBy: { rank: "asc" },
    take: 5,
  });

  return (
    <CampaignDetailView
      campaign={{
        slug: campaign.slug,
        name: campaign.name,
        nameAr: campaign.nameAr,
        tagline: campaign.tagline,
        taglineAr: campaign.taglineAr,
        status: campaign.status,
        standardPrice: campaign.standardPrice,
        standardVoucherValue: campaign.standardVoucherValue,
        maxPurchasesPerUser: campaign.maxPurchasesPerUser,
        questionCount: campaign.questionCount,
        timerSeconds: campaign.timerSeconds,
        gameplayDeadline: campaign.gameplayDeadline?.toISOString() ?? null,
        purchaseCutoff: campaign.purchaseCutoff?.toISOString() ?? null,
        heroImageUrl: campaign.heroImageUrl,
        showInDirectory: campaign.showInDirectory,
        showLeaderboard: campaign.showLeaderboard,
        showWinners: campaign.showWinners,
        rulesText: campaign.rulesText,
        rulesTextAr: campaign.rulesTextAr,
        voucherTerms: campaign.voucherTerms,
        voucherTermsAr: campaign.voucherTermsAr,
        prize: campaign.prize
          ? {
              name: campaign.prize.name,
              nameAr: campaign.prize.nameAr,
              description: campaign.prize.description,
              descriptionAr: campaign.prize.descriptionAr,
              imageUrl: campaign.prize.imageUrl,
            }
          : null,
        merchant: campaign.merchant
          ? { name: campaign.merchant.name, nameAr: campaign.merchant.nameAr }
          : null,
        winners: campaign.winners.map((w) => ({
          id: w.id,
          maskedName: w.maskedName,
          prizeName: w.prizeName,
        })),
        top: top.map((r) => ({
          id: r.id,
          rank: r.rank,
          displayName: r.displayName,
          score: r.score,
          timeMs: r.timeMs,
        })),
        canPurchase: state.canPurchase,
        closed: state.closed,
      }}
    />
  );
}
