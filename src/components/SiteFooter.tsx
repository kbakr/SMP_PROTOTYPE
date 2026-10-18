"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="mt-16 border-t border-white/50 bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="font-display text-lg text-white">{t("brand")}</div>
          <p className="mt-1 max-w-md text-slate-400">{t("footerDemo")}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-slate-300">
          <Link href="/campaigns">{t("navCampaigns")}</Link>
          <Link href="/winners">{t("navWinners")}</Link>
          <Link href="/admin">{t("navAdmin")}</Link>
          <Link href="/investor">{t("navInvestor")}</Link>
        </div>
      </div>
    </footer>
  );
}
