import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge, Section } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) notFound();
  if (!campaign.showLeaderboard) {
    return (
      <Section title="Leaderboard hidden">
        <p>Admin has disabled public leaderboard for this campaign.</p>
        <Link href={`/campaigns/${slug}`} className="mt-4 inline-block font-bold text-rose-700">
          ← Back to campaign
        </Link>
      </Section>
    );
  }

  const rows = await prisma.leaderboardResult.findMany({
    where: { campaignId: campaign.id },
    orderBy: { rank: "asc" },
    take: 100,
  });

  return (
    <Section
      title={`${campaign.name} leaderboard`}
      subtitle="Score DESC · time ASC · earliest qualifying attempt ASC · best attempt per person"
      action={<Badge tone="live">Provisional</Badge>}
    >
      <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-bold">#{r.rank}</td>
                <td className="px-4 py-3">{r.displayName}</td>
                <td className="px-4 py-3">{r.score}/5</td>
                <td className="px-4 py-3">{(r.timeMs / 1000).toFixed(2)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="p-6 text-center text-slate-500">No completed attempts yet.</p>
        ) : null}
      </div>
      <Link href={`/campaigns/${slug}`} className="mt-6 inline-block text-sm font-bold text-rose-700">
        ← Campaign details
      </Link>
    </Section>
  );
}
