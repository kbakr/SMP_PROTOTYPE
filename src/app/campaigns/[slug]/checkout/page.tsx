"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { Button, Section } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

function CheckoutInner() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();
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
    setStatus("…");
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
      JSON.stringify({
        voucher: paid.voucher,
        attempt: paid.attempt,
        transaction: paid.transaction,
      }),
    );
    router.push(`/campaigns/${params.slug}/success`);
  }

  async function abandon() {
    const customer = JSON.parse(window.localStorage.getItem("smp-customer") || "null");
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
    setStatus("Checkout abandoned — CRM recovery segment updated.");
  }

  return (
    <Section title={t("checkoutTitle")} subtitle={`${t("checkoutSub")} · ${offer}`}>
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl bg-white/80 p-6">
        <p className="text-sm text-slate-600">{t("successSub")}</p>
        <Button className="w-full" disabled={loading} onClick={() => pay("success")}>
          {loading ? "…" : t("paySuccess")}
        </Button>
        <Button className="w-full" variant="ghost" disabled={loading} onClick={() => pay("failure")}>
          {t("payFail")}
        </Button>
        <Button className="w-full" variant="danger" disabled={loading} onClick={abandon}>
          {t("abandonCheckout")}
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
