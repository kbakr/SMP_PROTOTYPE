"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, LinkButton, Section } from "@/components/ui";
import { formatEGP } from "@/lib/utils";

export default function SuccessPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<{
    voucher?: { code: string; faceValue: number };
    attempt?: { id: string };
  } | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("smp-last-purchase");
    if (raw) setData(JSON.parse(raw));
  }, []);

  return (
    <Section title="Voucher issued" subtitle="Payment succeeded · voucher before challenge · demo only">
      <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-8 text-white shadow-xl">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-100">Merchant voucher</p>
        <div className="mt-2 font-display text-4xl">{data?.voucher?.code || "—"}</div>
        <p className="mt-3 text-lg">
          Face value {formatEGP(data?.voucher?.faceValue || 500)} — genuine merchant value (simulated).
        </p>
        <p className="mt-4 text-sm text-teal-50">
          Your skill challenge attempt is now entitled. Play now or later from My Account.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="!bg-white !text-teal-800"
            onClick={() => router.push(`/campaigns/${params.slug}/play`)}
          >
            Play now
          </Button>
          <LinkButton href="/account" variant="ghost" className="!border-white/40 !text-white">
            My Account
          </LinkButton>
        </div>
      </div>
    </Section>
  );
}
