import { prisma } from "./db";

export const campaignInclude = {
  prize: true,
  merchant: true,
  market: true,
  offers: { where: { active: true }, orderBy: { priority: "asc" as const } },
} as const;

export async function getHomepageData() {
  const [modules, featured, active, upcoming, past, winners, liveWithLb] = await Promise.all([
    prisma.homepageModuleConfig.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.campaign.findMany({
      where: { featured: true, showOnHome: true, status: { in: ["Live", "Scheduled"] } },
      include: campaignInclude,
      orderBy: { homeSortOrder: "asc" },
    }),
    prisma.campaign.findMany({
      where: { showOnHome: true, showInDirectory: true, status: "Live" },
      include: campaignInclude,
      orderBy: { homeSortOrder: "asc" },
    }),
    prisma.campaign.findMany({
      where: { showOnHome: true, showInUpcoming: true, status: "Scheduled" },
      include: campaignInclude,
      orderBy: { homeSortOrder: "asc" },
    }),
    prisma.campaign.findMany({
      where: { showInPast: true, status: { in: ["Closed", "Archived"] } },
      include: campaignInclude,
      orderBy: { homeSortOrder: "asc" },
    }),
    prisma.winner.findMany({
      where: { verified: true, publicityConsent: true, publishedAt: { not: null } },
      include: { campaign: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
    prisma.campaign.findMany({
      where: { showOnHome: true, showLeaderboard: true, status: { in: ["Live", "Closing", "Closed"] } },
      orderBy: { homeSortOrder: "asc" },
      take: 5,
    }),
  ]);

  const leaderboardPreviews = await Promise.all(
    liveWithLb.map(async (c) => ({
      campaign: c,
      rows: await prisma.leaderboardResult.findMany({
        where: { campaignId: c.id },
        orderBy: { rank: "asc" },
        take: 5,
      }),
    })),
  );

  // Filter winners to campaigns that allow showWinners
  const visibleWinners = winners.filter((w) => w.campaign.showWinners && w.campaign.showInDirectory !== false);

  return {
    modules,
    featured,
    active,
    upcoming,
    past,
    winners: visibleWinners,
    leaderboardPreviews,
  };
}

export async function getCampaignBySlug(slug: string) {
  return prisma.campaign.findUnique({
    where: { slug },
    include: {
      ...campaignInclude,
      landingPages: true,
      winners: { where: { verified: true, publicityConsent: true } },
    },
  });
}

export async function listCampaigns(filter?: "active" | "upcoming" | "completed") {
  const where =
    filter === "active"
      ? { showInDirectory: true, status: "Live" }
      : filter === "upcoming"
        ? { showInDirectory: true, showInUpcoming: true, status: "Scheduled" }
        : filter === "completed"
          ? { showInDirectory: true, showInPast: true, status: { in: ["Closed", "Archived", "Closing"] } }
          : { showInDirectory: true };

  return prisma.campaign.findMany({
    where,
    include: campaignInclude,
    orderBy: { homeSortOrder: "asc" },
  });
}

export function publicCampaignState(campaign: {
  status: string;
  purchaseCutoff: Date | null;
  gameplayDeadline: Date | null;
}) {
  const now = new Date();
  const canPurchase =
    campaign.status === "Live" &&
    (!campaign.purchaseCutoff || now < campaign.purchaseCutoff);
  const canPlay =
    ["Live", "Closing"].includes(campaign.status) &&
    (!campaign.gameplayDeadline || now < campaign.gameplayDeadline);
  return { canPurchase, canPlay, closed: ["Closed", "Archived"].includes(campaign.status) };
}
