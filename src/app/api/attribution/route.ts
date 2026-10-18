import { NextResponse } from "next/server";
import { recordLpAttribution } from "@/lib/checkout";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await recordLpAttribution({
    landingPageSlug: body.slug,
    customerId: body.customerId,
  });
  if (!result) return NextResponse.json({ ok: false, error: "LP not found or inactive" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    campaignSlug: result.lp.campaign.slug,
    offerId: result.lp.offerId,
    touchId: result.touch.id,
  });
}
