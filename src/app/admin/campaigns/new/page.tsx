"use client";

import { useEffect, useState } from "react";
import { CampaignBuilderForm } from "@/components/CampaignBuilderForm";

export default function NewCampaignPage() {
  const [merchants, setMerchants] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/campaigns")
      .then((r) => r.json())
      .then((d) => {
        setMerchants(d.merchants || []);
        if (!d.merchants?.length) setError("No merchants — run seed/reset first.");
      })
      .catch(() => setError("Failed to load merchants"));
  }, []);

  if (error) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-rose-700">{error}</p>;
  }
  if (!merchants.length) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-slate-600">Loading…</p>;
  }

  return <CampaignBuilderForm merchants={merchants} />;
}
