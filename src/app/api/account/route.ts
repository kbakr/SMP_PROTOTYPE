import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nextBestAction } from "@/lib/business-rules";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const phone = searchParams.get("phone");

  const customer = customerId
    ? await prisma.customer.findUnique({ where: { id: customerId } })
    : phone
      ? await prisma.customer.findUnique({ where: { phone } })
      : null;

  if (!customer) return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });

  const [campaigns, vouchers, events] = await Promise.all([
    prisma.customerCampaign.findMany({
      where: { customerId: customer.id },
      include: { campaign: true },
    }),
    prisma.voucher.findMany({
      where: { customerId: customer.id },
      include: { campaign: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.customerEvent.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const nba = campaigns.map((cc) => {
    const hasReplay = cc.lifecycle === "played" && cc.purchaseCount < 5;
    const nbaItem = nextBestAction({
      unusedAttempts: cc.unusedAttempts,
      purchaseCount: cc.purchaseCount,
      campaignStatus: cc.campaign.status,
      hasEligibleReplayOffer: hasReplay,
    });
    return { campaignSlug: cc.campaign.slug, ...nbaItem };
  });

  return NextResponse.json({
    ok: true,
    customer,
    campaigns,
    vouchers,
    events,
    nba,
  });
}
