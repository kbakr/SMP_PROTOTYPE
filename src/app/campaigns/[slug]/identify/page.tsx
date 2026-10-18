"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button, Section } from "@/components/ui";

function IdentifyForm() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
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
    <Section
      title="Verify your mobile"
      subtitle="Simulated OTP only — use demo code 123456. Must be 18+. Demo identities are not production-secure."
    >
      <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-3xl bg-white/80 p-6">
        <label className="block text-sm font-semibold">
          Mobile (Egypt)
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Demo OTP
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Verifying…" : "Continue"}
        </Button>
        <p className="text-xs text-slate-500">
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
