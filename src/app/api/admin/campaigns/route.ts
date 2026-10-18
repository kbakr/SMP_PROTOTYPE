import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    include: { prize: true, merchant: true },
    orderBy: { homeSortOrder: "asc" },
  });
  const modules = await prisma.homepageModuleConfig.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ campaigns, modules });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  if (body.type === "campaign") {
    const before = await prisma.campaign.findUnique({ where: { id: body.id } });
    if (!before) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

    // Prototype guard: do not silently change locked LIVE commercial terms via this endpoint
    const data: Record<string, unknown> = {};
    const allowed = [
      "showOnHome",
      "showInDirectory",
      "featured",
      "homeSortOrder",
      "showLeaderboard",
      "showWinners",
      "showInUpcoming",
      "showInPast",
      "status",
    ] as const;
    for (const k of allowed) {
      if (k in body) data[k] = body[k];
    }

    const updated = await prisma.campaign.update({ where: { id: body.id }, data });
    await prisma.customerEvent.create({
      data: {
        type: "admin_campaign_visibility",
        campaignId: updated.id,
        payload: JSON.stringify({
          before: Object.fromEntries(allowed.map((k) => [k, before[k as keyof typeof before]])),
          after: Object.fromEntries(allowed.map((k) => [k, updated[k as keyof typeof updated]])),
        }),
      },
    });
    return NextResponse.json({ ok: true, campaign: updated });
  }

  if (body.type === "module") {
    const updated = await prisma.homepageModuleConfig.update({
      where: { key: body.key },
      data: {
        ...(typeof body.enabled === "boolean" ? { enabled: body.enabled } : {}),
        ...(typeof body.sortOrder === "number" ? { sortOrder: body.sortOrder } : {}),
      },
    });
    return NextResponse.json({ ok: true, module: updated });
  }

  return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
}
