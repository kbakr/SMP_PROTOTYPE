import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignBySlug, publicCampaignState } from "@/lib/campaigns";
import { Badge, LinkButton, Section } from "@/components/ui";
import { egyptDate, formatEGP } from "@/lib/utils";
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

  const unavailable = !campaign.showInDirectory && campaign.status !== "Live";

  return (
    <div>
      <section className="relative min-h-[50vh] overflow-hidden">
        <Image
          src={campaign.heroImageUrl || campaign.prize?.imageUrl || "/prizes/phone.svg"}
          alt={campaign.prize?.name || campaign.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6">
          <Badge tone={campaign.status === "Live" ? "live" : campaign.status === "Scheduled" ? "soon" : "closed"}>
            {campaign.status}
          </Badge>
          <h1 className="mt-3 font-display text-4xl text-white sm:text-6xl">{campaign.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-white/85">{campaign.tagline}</p>
        </div>
      </section>

      {unavailable || state.closed ? (
        <Section title="Campaign unavailable for new entries">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            This campaign is closed or hidden from listings. Historical leaderboard and winners may still
            be available if enabled. No new purchases after cutoff.
          </div>
        </Section>
      ) : null}

      <Section title="Prize, price & voucher">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/80 p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Hero prize</div>
            <div className="mt-2 font-display text-2xl">{campaign.prize?.name}</div>
            <p className="mt-2 text-sm text-slate-600">{campaign.prize?.description}</p>
            <p className="mt-3 text-xs font-semibold text-rose-700">Competed for — not purchased</p>
          </div>
          <div className="rounded-3xl bg-rose-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-rose-700">You pay</div>
            <div className="mt-2 font-display text-3xl">{formatEGP(campaign.standardPrice)}</div>
            <p className="mt-2 text-sm text-slate-600">
              Personalized offers may differ (e.g. EGP350) — price and voucher value are independent.
            </p>
          </div>
          <div className="rounded-3xl bg-teal-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-teal-700">Merchant voucher</div>
            <div className="mt-2 font-display text-3xl">{formatEGP(campaign.standardVoucherValue)}</div>
            <p className="mt-2 text-sm text-slate-600">{campaign.merchant?.name}</p>
            <p className="mt-2 text-xs text-slate-500">{campaign.voucherTerms}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {state.canPurchase ? (
            <LinkButton href={`/campaigns/${campaign.slug}/identify`}>Enter now</LinkButton>
          ) : (
            <span className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">
              Purchases closed
            </span>
          )}
          {campaign.status === "Scheduled" ? (
            <LinkButton href={`/campaigns/${campaign.slug}/notify`} variant="secondary">
              Notify me
            </LinkButton>
          ) : null}
          {campaign.showLeaderboard ? (
            <LinkButton href={`/campaigns/${campaign.slug}/leaderboard`} variant="ghost">
              Leaderboard
            </LinkButton>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Deadline: {egyptDate(campaign.gameplayDeadline)} · Purchase cutoff:{" "}
          {egyptDate(campaign.purchaseCutoff)} · Max {campaign.maxPurchasesPerUser} attempts ·{" "}
          {campaign.questionCount}Q / {campaign.timerSeconds}s
        </p>
      </Section>

      <Section title="Rules">
        <p className="max-w-3xl whitespace-pre-wrap text-slate-700">{campaign.rulesText}</p>
        <p className="mt-3 text-sm font-semibold text-slate-900">
          Skill-based · Not a lottery · Win not guaranteed
        </p>
      </Section>

      {campaign.showLeaderboard ? (
        <Section title={`${campaign.name} — top ranks`} subtitle="Provisional until winner verification">
          <ol className="space-y-2">
            {top.map((r) => (
              <li key={r.id} className="flex justify-between rounded-xl bg-white/80 px-4 py-3 text-sm">
                <span>
                  #{r.rank} {r.displayName}
                </span>
                <span>
                  {r.score}/5 · {(r.timeMs / 1000).toFixed(2)}s
                </span>
              </li>
            ))}
          </ol>
          <Link href={`/campaigns/${campaign.slug}/leaderboard`} className="mt-4 inline-block text-sm font-bold text-teal-700">
            View full leaderboard →
          </Link>
        </Section>
      ) : null}

      {campaign.showWinners && campaign.winners.length > 0 ? (
        <Section title="Verified winners">
          <div className="grid gap-3 sm:grid-cols-2">
            {campaign.winners.map((w) => (
              <div key={w.id} className="rounded-2xl bg-white/80 p-4">
                <Badge tone="demo">Demo</Badge>
                <div className="mt-2 font-display text-xl">{w.maskedName}</div>
                <div className="text-sm text-slate-600">{w.prizeName}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
