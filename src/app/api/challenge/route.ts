import { NextResponse } from "next/server";
import { startChallenge, submitChallenge } from "@/lib/checkout";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignSlug = searchParams.get("campaign");
  const customerId = searchParams.get("customerId");
  if (!campaignSlug || !customerId) {
    return NextResponse.json({ ok: false, error: "campaign and customerId required" }, { status: 400 });
  }
  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });
  if (!campaign) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const attempt = await prisma.attempt.findFirst({
    where: {
      customerId,
      campaignId: campaign.id,
      status: { in: ["entitled", "in_progress"] },
    },
    orderBy: { createdAt: "desc" },
    include: { voucher: true },
  });

  const questions = campaign.questions.map((q) => ({
    id: q.id,
    orderIndex: q.orderIndex,
    promptEn: q.promptEn,
    promptAr: q.promptAr,
    options: JSON.parse(q.optionsJson) as string[],
    optionsAr: q.optionsAr ? (JSON.parse(q.optionsAr) as string[]) : null,
    // never send correctIndex to client
  }));

  return NextResponse.json({
    ok: true,
    attempt,
    timerSeconds: campaign.timerSeconds,
    questions,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (body.action === "start") {
    const result = await startChallenge(body.attemptId);
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }
  if (body.action === "submit") {
    const result = await submitChallenge({
      attemptId: body.attemptId,
      answers: body.answers,
    });
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }
  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
