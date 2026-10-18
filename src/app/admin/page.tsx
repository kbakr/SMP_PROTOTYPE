"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Section, Badge } from "@/components/ui";

type Campaign = {
  id: string;
  slug: string;
  name: string;
  status: string;
  showOnHome: boolean;
  showInDirectory: boolean;
  featured: boolean;
  homeSortOrder: number;
  showLeaderboard: boolean;
  showWinners: boolean;
  showInUpcoming: boolean;
  showInPast: boolean;
  prize?: { name: string } | null;
};

type Mod = { key: string; enabled: boolean; sortOrder: number; titleEn?: string | null };

export default function AdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [modules, setModules] = useState<Mod[]>([]);
  const [msg, setMsg] = useState("");

  async function refresh() {
    const d = await fetch("/api/admin/campaigns").then((r) => r.json());
    setCampaigns(d.campaigns || []);
    setModules(d.modules || []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function patchCampaign(id: string, patch: Partial<Campaign>) {
    setMsg("Saving…");
    await fetch("/api/admin/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "campaign", id, ...patch }),
    });
    await refresh();
    setMsg("Saved — portal will reflect on next load.");
  }

  async function patchModule(key: string, enabled: boolean) {
    await fetch("/api/admin/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "module", key, enabled }),
    });
    await refresh();
  }

  async function resetDemo() {
    if (!confirm("Reset all demo data to seed?")) return;
    setMsg("Resetting…");
    const r = await fetch("/api/admin/reset", { method: "POST" }).then((x) => x.json());
    setMsg(r.ok ? "Demo reset complete" : r.error);
    await refresh();
  }

  return (
    <Section
      title="SMP Admin"
      subtitle="Visibility, featured order, homepage modules. Demo auth — not production-secure."
      action={
        <div className="flex gap-2">
          <Link href="/admin/customers" className="text-sm font-bold text-rose-700">
            Customer360
          </Link>
          <Link href="/admin/crm" className="text-sm font-bold text-rose-700">
            CRM
          </Link>
          <Link href="/admin/bi" className="text-sm font-bold text-rose-700">
            BI
          </Link>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge tone="demo">Demo management</Badge>
        <Button variant="danger" onClick={resetDemo}>
          Reset Demo
        </Button>
        <Link href="/" className="text-sm font-semibold text-teal-700">
          Preview portal →
        </Link>
        {msg ? <span className="text-sm text-slate-600">{msg}</span> : null}
      </div>

      <h3 className="font-display text-xl">Homepage modules</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((m) => (
          <label key={m.key} className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={m.enabled}
              onChange={(e) => patchModule(m.key, e.target.checked)}
            />
            {m.titleEn || m.key}
          </label>
        ))}
      </div>

      <h3 className="mt-10 font-display text-xl">Campaigns</h3>
      <div className="mt-4 space-y-4">
        {campaigns.map((c) => (
          <article key={c.id} className="rounded-3xl border border-white/60 bg-white/80 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="font-display text-2xl">{c.name}</h4>
                <p className="text-sm text-slate-600">
                  {c.prize?.name} · <code>{c.slug}</code>
                </p>
                <Badge tone={c.status === "Live" ? "live" : "soon"}>{c.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold">
                  Sort
                  <input
                    type="number"
                    className="ml-2 w-20 rounded border px-2 py-1"
                    value={c.homeSortOrder}
                    onChange={(e) => patchCampaign(c.id, { homeSortOrder: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              {(
                [
                  ["showOnHome", "Show on home"],
                  ["showInDirectory", "Directory"],
                  ["featured", "Featured"],
                  ["showLeaderboard", "Leaderboard"],
                  ["showWinners", "Winners"],
                  ["showInUpcoming", "Upcoming"],
                  ["showInPast", "Past"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(c[key])}
                    onChange={(e) => patchCampaign(c.id, { [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {["Live", "Scheduled", "Paused", "Closed", "Archived"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`rounded-full px-3 py-1 ${c.status === s ? "bg-slate-900 text-white" : "bg-slate-100"}`}
                  onClick={() => {
                    if (c.status === "Live" && s !== "Live") {
                      if (!confirm("Change status away from LIVE? Competition terms stay locked; visibility only."))
                        return;
                    }
                    patchCampaign(c.id, { status: s });
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
