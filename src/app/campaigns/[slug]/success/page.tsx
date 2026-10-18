"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, LinkButton, Section } from "@/components/ui";
import { formatEGP } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

export default function SuccessPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const [data, setData] = useState<{
    voucher?: { code: string; faceValue: number };
    attempt?: { id: string };
  } | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("smp-last-purchase");
    if (raw) setData(JSON.parse(raw));
  }, []);

  return (
    <Section title={t("successTitle")} subtitle={t("successSub")}>
      <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-8 text-white shadow-xl">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-100">{t("voucher")}</p>
        <div className="mt-2 font-display text-4xl" dir="ltr">
          {data?.voucher?.code || "—"}
        </div>
        <p className="mt-3 text-lg">
          {formatEGP(data?.voucher?.faceValue || 500, locale)}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="!bg-white !text-teal-800"
            onClick={() => router.push(`/campaigns/${params.slug}/play`)}
          >
            {t("playChallenge")}
          </Button>
          <LinkButton href="/account" variant="ghost" className="!border-white/40 !text-white">
            {t("navAccount")}
          </LinkButton>
        </div>
      </div>
    </Section>
  );
}
