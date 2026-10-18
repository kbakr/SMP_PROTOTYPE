import { NextResponse } from "next/server";
import { abandonCheckout, createCheckout, simulatePayment } from "@/lib/checkout";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const action = body.action as string;

  if (action === "create") {
    const result = await createCheckout({
      customerId: body.customerId,
      campaignSlug: body.campaignSlug,
      offerCode: body.offerCode,
      idempotencyKey: body.idempotencyKey,
    });
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }

  if (action === "pay") {
    const result = await simulatePayment({
      idempotencyKey: body.idempotencyKey,
      outcome: body.outcome,
    });
    if (!result.ok) return NextResponse.json(result, { status: 402 });
    return NextResponse.json(result);
  }

  if (action === "abandon") {
    await abandonCheckout({
      customerId: body.customerId,
      campaignId: body.campaignId,
      step: body.step,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "offers") {
    const campaign = await prisma.campaign.findUnique({
      where: { slug: body.campaignSlug },
      include: { offers: { where: { active: true }, orderBy: { priority: "asc" } } },
    });
    const cc = body.customerId
      ? await prisma.customerCampaign.findFirst({
          where: { customerId: body.customerId, campaignId: campaign?.id },
        })
      : null;
    return NextResponse.json({ ok: true, offers: campaign?.offers ?? [], customerCampaign: cc });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
