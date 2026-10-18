"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, Section } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

export default function NotifyPage() {
  const params = useParams<{ slug: string }>();
  const { t } = useLocale();
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    await fetch("/api/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignSlug: params.slug, phone, consent }),
    });
    setDone(true);
  }

  return (
    <Section title={t("notifyTitle")} subtitle={t("notifySub")}>
      {done ? (
        <p className="rounded-2xl bg-teal-50 p-4 text-teal-900">✓</p>
      ) : (
        <form onSubmit={submit} className="max-w-md space-y-3 rounded-3xl bg-white/80 p-6">
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder={t("phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            required
          />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            {t("consentNotify")}
          </label>
          <Button type="submit" disabled={!consent}>
            {t("submitInterest")}
          </Button>
        </form>
      )}
    </Section>
  );
}
