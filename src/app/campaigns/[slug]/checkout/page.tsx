"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { Button, Section } from "@/components/ui";

function CheckoutInner() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const offer = search.get("offer") || "STD500";
  const idempotencyKey = useMemo(
    () => `chk-${params.slug}-${offer}-${Date.now()}`,
    [params.slug, offer],
  );
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function pay(outcome: "success" | "failure" = "success") {
    const customer = JSON.parse(window.localStorage.getItem("smp-customer") || "null");
    if (!customer) {
      router.replace(`/campaigns/${params.slug}/identify`);
      return;
    }
    setLoading(true);
    setStatus("Creating checkout…");
    const created = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        customerId: customer.id,
        campaignSlug: params.slug,
        offerCode: offer,
        idempotencyKey,
      }),
    }).then((r) => r.json());

    if (!created.ok) {
      setLoading(false);
      setStatus(created.error || "Checkout failed");
      return;
    }

    setStatus("Simulating payment…");
    const paid = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pay", idempotencyKey, outcome }),
    }).then((r) => r.json());

    setLoading(false);
    if (!paid.ok) {
      setStatus(paid.error || "Payment failed");
      return;
    }
    window.localStorage.setItem(
      "smp-last-purchase",
      JSON.stringify({ voucher: paid.voucher, attempt: paid.attempt, transaction: paid.transaction }),
    );
    router.push(`/campaigns/${params.slug}/success`);
  }

  async function abandon() {
    const customer = JSON.parse(window.localStorage.getItem("smp-customer") || "null");
    const campRes = await fetch(`/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "offers", campaignSlug: params.slug, customerId: customer?.id }),
    }).then((r) => r.json());
    // resolve campaign id via a lightweight abandon that needs campaignId — fetch from create failure path
    const created = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        customerId: customer.id,
        campaignSlug: params.slug,
        offerCode: offer,
        idempotencyKey: `abandon-${Date.now()}`,
      }),
    }).then((r) => r.json());
    if (created.ok && created.transaction) {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "abandon",
          customerId: customer.id,
          campaignId: created.transaction.campaignId,
          step: "payment",
        }),
      });
    }
    void campRes;
    setStatus("Checkout abandoned — CRM recovery segment updated.");
  }

  return (
    <Section
      title="Simulated checkout"
      subtitle={`Offer ${offer}. No real charges. Payment is idempotent by key.`}
    >
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl bg-white/80 p-6">
        <p className="text-sm text-slate-600">
          After success, a merchant voucher is issued <strong>before</strong> challenge access.
        </p>
        <Button className="w-full" disabled={loading} onClick={() => pay("success")}>
          {loading ? "Processing…" : "Pay (simulated success)"}
        </Button>
        <Button className="w-full" variant="ghost" disabled={loading} onClick={() => pay("failure")}>
          Simulate payment failure
        </Button>
        <Button className="w-full" variant="danger" disabled={loading} onClick={abandon}>
          Abandon checkout
        </Button>
        {status ? <p className="text-sm text-slate-700">{status}</p> : null}
      </div>
    </Section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  );
}
