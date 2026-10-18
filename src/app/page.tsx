import Link from "next/link";
import { getHomepageData } from "@/lib/campaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Badge, EmptyState, Section } from "@/components/ui";
import { egyptDate, formatEGP } from "@/lib/utils";

export const dynamic = "force-dynamic";

function moduleEnabled(
  modules: { key: string; enabled: boolean }[],
  key: string,
) {
  const m = modules.find((x) => x.key === key);
  return m ? m.enabled : true;
}

export default async function HomePage() {
  const data = await getHomepageData();
  const { modules, featured, active, upcoming, winners, leaderboardPreviews } = data;

  return (
    <div>
      {moduleEnabled(modules, "hero") ? <HeroCarousel campaigns={featured.length ? featured : active} /> : null}

      {moduleEnabled(modules, "how_it_works") ? (
        <Section
          title="How SMP Works"
          subtitle="Transparent skill promotions with merchant value first — never framed as buying the prize."
        >
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: "Buy merchant value", d: "Pay the campaign price for a genuine voucher." },
              { n: "02", t: "Receive voucher", d: "Issued after simulated payment — before you play." },
              { n: "03", t: "Play skill challenge", d: "5 questions · 60 seconds · answers are final." },
              { n: "04", t: "Compete for prize", d: "Ranked by score, then time. No random draw." },
            ].map((s) => (
              <li key={s.n} className="rounded-3xl border border-white/60 bg-white/70 p-5">
                <div className="font-display text-3xl text-rose-600">{s.n}</div>
                <h3 className="mt-2 font-display text-xl">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {moduleEnabled(modules, "active") ? (
        <Section
          title="Active campaigns"
          subtitle="Each card shows prize, price, voucher value, deadline, and CTA — independently configured."
          action={
            <Link href="/campaigns" className="text-sm font-bold text-rose-700">
              View all →
            </Link>
          }
        >
          {active.length === 0 ? (
            <EmptyState message="No live campaigns on the homepage right now." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {moduleEnabled(modules, "upcoming") ? (
        <Section title="Coming soon" subtitle="Register interest — consent required for notify.">
          {upcoming.length === 0 ? (
            <EmptyState message="No upcoming campaigns scheduled for display." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((c) => (
                <CampaignCard key={c.id} campaign={c} ctaLabel="Notify me" />
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {moduleEnabled(modules, "winners") ? (
        <Section title="Verified winners" subtitle="Privacy-safe display · demo data clearly labeled.">
          {winners.length === 0 ? (
            <EmptyState message="No verified winners published yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {winners.map((w) => (
                <div key={w.id} className="rounded-3xl border border-white/60 bg-white/75 p-5">
                  <Badge tone="demo">Demo winner</Badge>
                  <div className="mt-3 font-display text-2xl">{w.maskedName}</div>
                  <p className="text-sm text-slate-600">
                    {w.prizeName} · {w.campaign.name}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{egyptDate(w.publishedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {moduleEnabled(modules, "leaderboards") ? (
        <Section
          title="Campaign leaderboards"
          subtitle="Each preview is campaign-specific — no cross-campaign mix."
        >
          {leaderboardPreviews.length === 0 ? (
            <EmptyState message="No leaderboards to preview." />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {leaderboardPreviews.map(({ campaign, rows }) => (
                <div key={campaign.id} className="rounded-3xl border border-white/60 bg-white/75 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl">{campaign.name}</h3>
                      <Badge tone="live">Provisional</Badge>
                    </div>
                    <Link
                      href={`/campaigns/${campaign.slug}/leaderboard`}
                      className="text-sm font-bold text-teal-700"
                    >
                      Full board →
                    </Link>
                  </div>
                  <ol className="mt-4 space-y-2">
                    {rows.length === 0 ? (
                      <li className="text-sm text-slate-500">No ranked attempts yet.</li>
                    ) : (
                      rows.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span>
                            <strong>#{r.rank}</strong> {r.displayName}
                          </span>
                          <span className="text-slate-600">
                            {r.score}/5 · {(r.timeMs / 1000).toFixed(2)}s
                          </span>
                        </li>
                      ))
                    )}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {moduleEnabled(modules, "trust") ? (
        <Section title="Merchant value & trust">
          <div className="overflow-hidden rounded-3xl bg-slate-950 p-8 text-white">
            <h3 className="font-display text-3xl">Real voucher. Skill ranking. Clear terms.</h3>
            <p className="mt-3 max-w-3xl text-slate-300">
              Purchase price and voucher value are configured independently per offer. A purchase never
              buys the prize and never guarantees a win. Production participation requires Egyptian
              legal, payment and merchant sign-offs — this build uses simulated integrations only.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1">18+</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Max 5 attempts / campaign</span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Example standard: {formatEGP(500)} → {formatEGP(500)} voucher
              </span>
            </div>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
