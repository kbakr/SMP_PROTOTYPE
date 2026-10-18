import Link from "next/link";
import { listCampaigns } from "@/lib/campaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { EmptyState, Section } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter =
    sp.filter === "active" || sp.filter === "upcoming" || sp.filter === "completed"
      ? sp.filter
      : undefined;
  const campaigns = await listCampaigns(filter);

  const tabs = [
    { key: undefined, label: "All visible", href: "/campaigns" },
    { key: "active", label: "Active", href: "/campaigns?filter=active" },
    { key: "upcoming", label: "Upcoming", href: "/campaigns?filter=upcoming" },
    { key: "completed", label: "Completed", href: "/campaigns?filter=completed" },
  ] as const;

  return (
    <Section
      title="Campaign directory"
      subtitle="Admin visibility controls what appears here — hidden campaigns keep their history."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === t.key ? "bg-slate-900 text-white" : "bg-white/80 text-slate-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      {campaigns.length === 0 ? (
        <EmptyState message="No campaigns match this filter." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </Section>
  );
}
