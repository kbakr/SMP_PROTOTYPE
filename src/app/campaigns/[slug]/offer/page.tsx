"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button, Section } from "@/components/ui";
import { formatEGP } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

type Offer = {
  id: string;
  code: string;
  name: string;
  purchasePrice: number;
  voucherValue: number;
  offerType: string;
  eligibleSegment?: string | null;
};

function OfferInner() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { locale, t } = useLocale();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [cc, setCc] = useState<{
    unusedAttempts?: number;
    purchaseCount?: number;
    lifecycle?: string;
  } | null>(null);

  useEffect(() => {
    const customer = JSON.parse(window.localStorage.getItem("smp-customer") || "null");
    if (!customer) {
      router.replace(`/campaigns/${params.slug}/identify`);
      return;
    }
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "offers",
        campaignSlug: params.slug,
        customerId: customer.id,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        setOffers(d.offers || []);
        setCc(d.customerCampaign);
        const pref = search.get("offer");
        const lifecycle = d.customerCampaign?.lifecycle;
        let pick = pref;
        if (!pick && lifecycle === "checkout_abandoner") pick = "RECOVER350";
        if (!pick && lifecycle === "played") pick = "REPLAY350";
        if (!pick) pick = d.offers?.find((o: Offer) => o.offerType === "standard")?.code;
        setSelected(pick || "");
      });
  }, [params.slug, router, search]);

  if (cc?.unusedAttempts && cc.unusedAttempts > 0) {
    return (
      <Section title={t("nbaPlay")} subtitle={t("playChallenge")}>
        <Button onClick={() => router.push(`/campaigns/${params.slug}/play`)}>
          {t("playChallenge")}
        </Button>
      </Section>
    );
  }

  return (
    <Section title={t("offerTitle")} subtitle={t("offerSub")}>
      <div className="grid gap-4 md:grid-cols-2">
        {offers.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setSelected(o.code)}
            className={`rounded-3xl border p-5 text-start transition ${
              selected === o.code
                ? "border-rose-500 bg-rose-50 ring-2 ring-rose-300"
                : "border-white bg-white/80"
            }`}
          >
            <div className="text-xs font-bold uppercase text-slate-500">{o.offerType}</div>
            <div className="mt-1 font-display text-xl">{o.name}</div>
            <div className="mt-3 text-sm">
              {t("price")} <strong>{formatEGP(o.purchasePrice, locale)}</strong> → {t("voucher")}{" "}
              <strong>{formatEGP(o.voucherValue, locale)}</strong>
            </div>
            <div className="mt-1 text-xs text-slate-500" dir="ltr">
              Code: {o.code}
            </div>
          </button>
        ))}
      </div>
      <Button
        className="mt-6"
        disabled={!selected}
        onClick={() => router.push(`/campaigns/${params.slug}/checkout?offer=${selected}`)}
      >
        {t("continueCheckout")}
      </Button>
    </Section>
  );
}

export default function OfferPage() {
  return (
    <Suspense>
      <OfferInner />
    </Suspense>
  );
}
