"use client";

import Link from "next/link";
import { CampaignCard, type CampaignCardData } from "@/components/CampaignCard";
import { EmptyState, Section } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

export function CampaignsDirectoryView({
  campaigns,
  filter,
}: {
  campaigns: (CampaignCardData & { id: string })[];
  filter?: "active" | "upcoming" | "completed";
}) {
  const { t } = useLocale();
  const tabs = [
    { key: undefined as undefined, label: t("filterAll"), href: "/campaigns" },
    { key: "active" as const, label: t("filterActive"), href: "/campaigns?filter=active" },
    { key: "upcoming" as const, label: t("filterUpcoming"), href: "/campaigns?filter=upcoming" },
    {
      key: "completed" as const,
      label: t("filterCompleted"),
      href: "/campaigns?filter=completed",
    },
  ];

  return (
    <Section title={t("directoryTitle")} subtitle={t("directorySub")}>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === tab.key ? "bg-slate-900 text-white" : "bg-white/80 text-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {campaigns.length === 0 ? (
        <EmptyState message={t("noFilterMatch")} />
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
