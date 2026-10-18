"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { Button } from "./ui";

export function SiteHeader() {
  const { t, locale, setLocale } = useLocale();
  const links = [
    { href: "/", label: t("navHome") },
    { href: "/campaigns", label: t("navCampaigns") },
    { href: "/winners", label: t("navWinners") },
    { href: "/account", label: t("navAccount") },
    { href: "/admin", label: t("navAdmin") },
    { href: "/investor", label: t("navInvestor") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="demo-ribbon">{t("demoBadge")}</div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-orange-400 to-teal-400 text-lg font-black text-white shadow-md">
            S
          </span>
          <div>
            <div className="font-display text-lg leading-none text-slate-900 group-hover:text-rose-700 sm:text-xl">
              {t("brand")}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("brandTagline")}
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:text-rose-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="!px-3 !py-1.5 text-xs"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          >
            {t("language")}
          </Button>
          <Link
            href="/account"
            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white md:hidden"
          >
            {t("navAccount")}
          </Link>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/50 px-3 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
