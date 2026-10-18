"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button, Section } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

function IdentifyForm() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [phone, setPhone] = useState("+201111111111");
  const [code, setCode] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.ok) {
      setError(data.error || "OTP failed");
      return;
    }
    window.localStorage.setItem("smp-token", data.token);
    window.localStorage.setItem("smp-customer", JSON.stringify(data.customer));
    const offer = search.get("offer");
    const q = offer ? `?offer=${offer}` : "";
    router.push(`/campaigns/${params.slug}/offer${q}`);
  }

  return (
    <Section title={t("identifyTitle")} subtitle={t("identifySub")}>
      <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-3xl bg-white/80 p-6">
        <label className="block text-sm font-semibold">
          {t("phone")}
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          {t("otpCode")}
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            dir="ltr"
            required
          />
        </label>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "…" : t("verifyContinue")}
        </Button>
        <p className="text-xs text-slate-500" dir="ltr">
          Personas: Ahmed +201111111111 · Mariam +201222222222 · Omar +201333333333 · Sara +201444444444
        </p>
      </form>
    </Section>
  );
}

export default function IdentifyPage() {
  return (
    <Suspense>
      <IdentifyForm />
    </Suspense>
  );
}
