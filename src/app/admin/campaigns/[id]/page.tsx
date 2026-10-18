"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CampaignBuilderForm } from "@/components/CampaignBuilderForm";

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<{
    campaign: Parameters<typeof CampaignBuilderForm>[0]["initial"];
    merchants: Array<{ id: string; name: string }>;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/campaigns?id=${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) {
          setError(d.error || "Not found");
          return;
        }
        setData({ campaign: d.campaign, merchants: d.merchants || [] });
      })
      .catch(() => setError("Failed to load"));
  }, [params.id]);

  if (error) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-rose-700">{error}</p>;
  }
  if (!data?.campaign) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-slate-600">Loading…</p>;
  }

  return <CampaignBuilderForm merchants={data.merchants} initial={data.campaign} />;
}
