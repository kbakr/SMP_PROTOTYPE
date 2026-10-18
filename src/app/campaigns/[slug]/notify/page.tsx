"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, Section } from "@/components/ui";

export default function NotifyPage() {
  const params = useParams<{ slug: string }>();
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
    <Section title="Notify me" subtitle="Upcoming campaign interest — consent required">
      {done ? (
        <p className="rounded-2xl bg-teal-50 p-4 text-teal-900">Interest recorded (demo).</p>
      ) : (
        <form onSubmit={submit} className="max-w-md space-y-3 rounded-3xl bg-white/80 p-6">
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            I consent to be notified about this campaign (demo).
          </label>
          <Button type="submit" disabled={!consent}>
            Save interest
          </Button>
        </form>
      )}
    </Section>
  );
}
