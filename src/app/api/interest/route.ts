import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.consent) {
    return NextResponse.json({ ok: false, error: "Consent required" }, { status: 400 });
  }
  const campaign = await prisma.campaign.findUnique({ where: { slug: body.campaignSlug } });
  if (!campaign) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  await prisma.campaignInterest.create({
    data: {
      campaignId: campaign.id,
      phone: body.phone,
      email: body.email,
      consent: true,
    },
  });
  return NextResponse.json({ ok: true });
}
