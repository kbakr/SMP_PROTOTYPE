import { prisma } from "@/lib/db";
import { Badge, EmptyState, Section } from "@/components/ui";
import { egyptDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WinnersPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const sp = await searchParams;
  const campaigns = await prisma.campaign.findMany({
    where: { showWinners: true },
    orderBy: { homeSortOrder: "asc" },
  });

  const winners = await prisma.winner.findMany({
    where: {
      verified: true,
      publicityConsent: true,
      ...(sp.campaign ? { campaign: { slug: sp.campaign } } : {}),
      campaign: { showWinners: true },
    },
    include: { campaign: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <Section
      title="Verified winners"
      subtitle="Only published, consenting, verified winners. Demo records are labeled."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/winners"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!sp.campaign ? "bg-slate-900 text-white" : "bg-white/80"}`}
        >
          All
        </Link>
        {campaigns.map((c) => (
          <Link
            key={c.id}
            href={`/winners?campaign=${c.slug}`}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              sp.campaign === c.slug ? "bg-slate-900 text-white" : "bg-white/80"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {winners.length === 0 ? (
        <EmptyState message="No verified winners to show." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((w) => (
            <article key={w.id} className="rounded-3xl border border-white/60 bg-white/80 p-5">
              {w.isDemo ? <Badge tone="demo">Demo data</Badge> : <Badge tone="live">Verified</Badge>}
              <h3 className="mt-3 font-display text-2xl">{w.maskedName}</h3>
              <p className="text-slate-600">{w.prizeName}</p>
              <p className="mt-2 text-sm">
                <Link href={`/campaigns/${w.campaign.slug}`} className="font-semibold text-rose-700">
                  {w.campaign.name}
                </Link>
              </p>
              <p className="mt-1 text-xs text-slate-500">{egyptDate(w.publishedAt)}</p>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
