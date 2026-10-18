import { prisma } from "@/lib/db";
import { Section, Badge } from "@/components/ui";
import { formatEGP } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const [segments, campaigns, waves] = await Promise.all([
    prisma.segment.findMany({ include: { _count: { select: { members: true } } } }),
    prisma.cRMCampaign.findMany({ include: { waves: true, campaign: true, segment: true } }),
    prisma.cRMWave.findMany({
      include: { interactions: true, crmCampaign: true },
      orderBy: { sentAt: "desc" },
    }),
  ]);

  return (
    <Section title="CRM & growth" subtitle="Simulated SMS/WhatsApp/email · consent-aware">
      <div className="mb-4">
        <Link href="/admin" className="text-sm font-bold text-rose-700">
          ← Admin
        </Link>
      </div>

      <h3 className="font-display text-xl">Segments</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {segments.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white/80 p-4">
            <div className="font-semibold">{s.name}</div>
            <p className="text-sm text-slate-600">{s.description}</p>
            <p className="mt-2 text-xs">Eligible count: {s._count.members}</p>
            <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-[10px]">{s.rulesJson}</pre>
          </div>
        ))}
      </div>

      <h3 className="mt-10 font-display text-xl">CRM campaigns</h3>
      <div className="mt-3 space-y-4">
        {campaigns.map((c) => (
          <article key={c.id} className="rounded-3xl bg-white/85 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-display text-2xl">{c.name}</h4>
              <Badge tone="demo">{c.status}</Badge>
            </div>
            <p className="text-sm text-slate-600">
              Objective: {c.objective} · Channel: {c.channel} · Offer {c.offerCode} · LP /lp/{c.lpSlug}
            </p>
            <p className="mt-2 text-sm">{c.messageTemplate}</p>
            <p className="mt-2 text-xs text-slate-500">
              Audience: {c.segment?.name} · Product campaign: {c.campaign?.name}
            </p>
          </article>
        ))}
      </div>

      <h3 className="mt-10 font-display text-xl">Waves & attribution</h3>
      <div className="mt-3 space-y-3">
        {waves.map((w) => {
          const sent = w.interactions.length;
          const responded = w.interactions.filter((i) => i.responded).length;
          const revenue = w.interactions.reduce((s, i) => s + i.revenueAttr, 0);
          const control = w.interactions.filter((i) => i.isControl).length;
          return (
            <div key={w.id} className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm">
              <div className="font-semibold">
                {w.name} · {w.crmCampaign.name}
              </div>
              <p>
                Sent {sent} · Responded {responded} · Control {control} · Attributed revenue{" "}
                {formatEGP(revenue)} (simulated)
              </p>
              <p className="text-xs text-slate-500">
                Recommendation: {responded > 0 ? "Scale" : "Investigate"} recovery creative
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
