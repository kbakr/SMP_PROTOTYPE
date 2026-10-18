import Link from "next/link";
import { prisma } from "@/lib/db";
import { Section, Badge } from "@/components/ui";
import { formatEGP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  const customers = await prisma.customer.findMany({
    where: { isDemo: true, phone: { startsWith: "+201" } },
    orderBy: { createdAt: "asc" },
    take: 60,
  });

  // Prefer named personas
  const personas = await prisma.customer.findMany({
    where: {
      phone: { in: ["+201111111111", "+201222222222", "+201333333333", "+201444444444"] },
    },
  });

  const selectedId = sp.id || personas[0]?.id;
  const selected = selectedId
    ? await prisma.customer.findUnique({
        where: { id: selectedId },
        include: {
          campaigns: { include: { campaign: true } },
          transactions: { include: { offer: true }, orderBy: { createdAt: "desc" } },
          vouchers: true,
          attempts: { orderBy: { createdAt: "desc" } },
          events: { orderBy: { createdAt: "desc" }, take: 30 },
          attributions: { include: { landingPage: true, partner: true }, orderBy: { touchedAt: "desc" } },
          crmInteractions: true,
        },
      })
    : null;

  return (
    <Section title="Customer360" subtitle="Lifecycle, attribution, economics — shared records">
      <div className="mb-4 flex flex-wrap gap-2">
        {personas.map((p) => (
          <Link
            key={p.id}
            href={`/admin/customers?id=${p.id}`}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              selectedId === p.id ? "bg-slate-900 text-white" : "bg-white/80"
            }`}
          >
            {p.firstName} {p.lastName}
          </Link>
        ))}
      </div>

      {!selected ? (
        <p>No customer selected.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white/85 p-5 lg:col-span-1">
            <Badge tone="demo">Demo</Badge>
            <h2 className="mt-2 font-display text-3xl">
              {selected.firstName} {selected.lastName}
            </h2>
            <p className="text-sm text-slate-600">{selected.phone}</p>
            <p className="mt-2 text-sm">
              Marketing consent: {selected.marketingConsent ? "yes" : "no"} · Publicity:{" "}
              {selected.publicityConsent ? "yes" : "no"}
            </p>
            <p className="mt-4 text-xs text-slate-500">Also {customers.length} seeded leaderboard personas</p>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-3xl bg-white/85 p-5">
              <h3 className="font-display text-xl">Campaign lifecycle</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {selected.campaigns.map((c) => (
                  <li key={c.id} className="flex justify-between gap-2 border-b border-slate-100 py-2">
                    <span>
                      {c.campaign.name} · <em>{c.lifecycle}</em>
                    </span>
                    <span>
                      LTV {formatEGP(c.ltv)} · unused {c.unusedAttempts}
                      {c.bestRank ? ` · #${c.bestRank}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white/85 p-5">
              <h3 className="font-display text-xl">Attribution</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {selected.attributions.map((a) => (
                  <li key={a.id}>
                    {a.source}/{a.medium} · {a.partner?.name} · LP {a.landingPage?.slug} ·{" "}
                    {a.touchedAt.toISOString()}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white/85 p-5">
              <h3 className="font-display text-xl">Transactions & attempts</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {selected.transactions.map((t) => (
                  <li key={t.id}>
                    {formatEGP(t.amount)} · {t.status} · offer {t.offer?.code} · voucher value{" "}
                    {formatEGP(t.voucherValue)}
                  </li>
                ))}
              </ul>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {selected.attempts.map((a) => (
                  <li key={a.id}>
                    Attempt {a.status}
                    {a.score != null ? ` · ${a.score}/5 · ${((a.timeMs || 0) / 1000).toFixed(2)}s` : ""}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white/85 p-5">
              <h3 className="font-display text-xl">Event timeline</h3>
              <ul className="mt-3 max-h-56 space-y-1 overflow-auto text-xs text-slate-600">
                {selected.events.map((e) => (
                  <li key={e.id}>
                    {e.createdAt.toISOString()} · {e.type}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
