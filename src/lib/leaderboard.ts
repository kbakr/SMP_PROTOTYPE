import { prisma } from "./db";
import { bestAttemptPerCustomer, rankAttempts } from "./business-rules";

export async function recomputeCampaignLeaderboard(campaignId: string) {
  const attempts = await prisma.attempt.findMany({
    where: { campaignId, status: "completed", valid: true, score: { not: null }, timeMs: { not: null } },
    include: { customer: true },
  });

  const best = bestAttemptPerCustomer(
    attempts.map((a) => ({
      id: a.id,
      customerId: a.customerId,
      score: a.score!,
      timeMs: a.timeMs!,
      qualifyingAt: a.serverEndAt ?? a.finishedAt ?? a.createdAt,
      valid: a.valid,
      displayName:
        a.customer.displayName ||
        `${a.customer.firstName} ${a.customer.lastName.charAt(0)}.`,
    })),
  );

  const ranked = rankAttempts(best);

  await prisma.$transaction(async (tx) => {
    await tx.leaderboardResult.deleteMany({ where: { campaignId } });
    for (const row of ranked) {
      await tx.leaderboardResult.create({
        data: {
          campaignId,
          customerId: row.customerId,
          attemptId: row.id,
          score: row.score,
          timeMs: row.timeMs,
          rank: row.rank,
          displayName: row.displayName,
          provisional: true,
          qualifyingAt: new Date(row.qualifyingAt),
        },
      });
      await tx.customerCampaign.updateMany({
        where: { customerId: row.customerId, campaignId },
        data: {
          bestScore: row.score,
          bestTimeMs: row.timeMs,
          bestRank: row.rank,
        },
      });
    }
  });

  return ranked;
}

export async function getCampaignLeaderboard(campaignId: string, limit = 50) {
  return prisma.leaderboardResult.findMany({
    where: { campaignId },
    orderBy: [{ rank: "asc" }],
    take: limit,
  });
}
