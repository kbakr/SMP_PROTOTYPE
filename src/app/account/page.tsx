"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Section, Badge } from "@/components/ui";
import { formatEGP } from "@/lib/utils";

type AccountPayload = {
  customer: { id: string; firstName: string; lastName: string; phone: string; displayName?: string };
  campaigns: Array<{
    lifecycle: string;
    unusedAttempts: number;
    purchaseCount: number;
    bestRank?: number | null;
    bestScore?: number | null;
    ltv: number;
    campaign: { slug: string; name: string; status: string };
  }>;
  vouchers: Array<{ code: string; faceValue: number; status: string; campaign: { name: string } }>;
  events: Array<{ type: string; createdAt: string; campaignId?: string | null }>;
  nba: Array<{ campaignSlug: string; action: string; label: string }>;
};

export default function AccountPage() {
  const [data, setData] = useState<AccountPayload | null>(null);
  const [phone, setPhone] = useState("+201333333333");

  async function load(p?: string) {
    const customer = JSON.parse(window.localStorage.getItem("smp-customer") || "null");
    const q = new URLSearchParams();
    if (customer?.id) q.set("customerId", customer.id);
    else q.set("phone", p || phone);
    const res = await fetch(`/api/account?${q}`).then((r) => r.json());
    if (res.ok) {
      setData(res);
      window.localStorage.setItem("smp-customer", JSON.stringify(res.customer));
    }
  }

  useEffect(() => {
    void load();
    // initial hydrate from localStorage customer only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Section title="My Account" subtitle="Personalized hub · demo identities">
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          className="rounded-xl border px-3 py-2 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="button" onClick={() => load(phone)}>
          Load demo customer
        </Button>
      </div>

      {!data ? (
        <p className="text-slate-600">Sign in via campaign OTP or load a demo phone above.</p>
      ) : (
        <div className="space-y-8">
          <div className="rounded-3xl bg-white/80 p-6">
            <h2 className="font-display text-2xl">
              {data.customer.displayName || `${data.customer.firstName} ${data.customer.lastName}`}
            </h2>
            <p className="text-sm text-slate-600">{data.customer.phone}</p>
            <Badge tone="demo">Demo customer</Badge>
          </div>

          <div>
            <h3 className="font-display text-xl">Next best actions</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {data.nba.map((n, i) => (
                <li key={i} className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                  <div className="font-semibold">{n.label}</div>
                  <Link
                    href={
                      n.action === "play"
                        ? `/campaigns/${n.campaignSlug}/play`
                        : `/campaigns/${n.campaignSlug}/offer`
                    }
                    className="mt-2 inline-block text-sm font-bold text-rose-700"
                  >
                    Go →
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl">Campaigns</h3>
            <div className="mt-3 grid gap-3">
              {data.campaigns.map((c, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/80 p-4">
                  <div>
                    <Link href={`/campaigns/${c.campaign.slug}`} className="font-semibold text-slate-900">
                      {c.campaign.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {c.lifecycle} · purchases {c.purchaseCount} · unused {c.unusedAttempts}
                      {c.bestRank ? ` · rank #${c.bestRank}` : ""}
                    </p>
                  </div>
                  <div className="text-sm font-semibold">{formatEGP(c.ltv)} LTV</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl">Vouchers</h3>
            <ul className="mt-3 space-y-2">
              {data.vouchers.map((v) => (
                <li key={v.code} className="rounded-xl bg-teal-50 px-4 py-3 text-sm">
                  <strong>{v.code}</strong> · {formatEGP(v.faceValue)} · {v.campaign.name} · {v.status}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl">Recent events</h3>
            <ul className="mt-3 max-h-64 space-y-1 overflow-auto text-sm text-slate-600">
              {data.events.map((e, i) => (
                <li key={i}>
                  {e.type} · {new Date(e.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Section>
  );
}
