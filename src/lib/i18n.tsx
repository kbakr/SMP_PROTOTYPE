"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "ar";

const dict = {
  en: {
    brand: "Super Mega Promo",
    demoBadge: "Demo Data — Simulated",
    navHome: "Home",
    navCampaigns: "Campaigns",
    navWinners: "Winners",
    navAccount: "My Account",
    navAdmin: "Admin",
    navInvestor: "Investor",
    howItWorks: "How SMP Works",
    step1: "Buy merchant value",
    step2: "Receive voucher",
    step3: "Play skill challenge",
    step4: "Compete for prize",
    activeCampaigns: "Active campaigns",
    upcoming: "Coming soon",
    recentWinners: "Verified winners",
    leaderboards: "Campaign leaderboards",
    viewAll: "View all",
    viewLeaderboard: "View full leaderboard",
    enterNow: "Enter now",
    notifyMe: "Notify me",
    price: "You pay",
    voucher: "Merchant voucher",
    prize: "Hero prize",
    deadline: "Deadline",
    status: "Status",
    provisional: "Provisional",
    trustTitle: "Real merchant value + skill",
    trustBody:
      "Every purchase includes a genuine merchant voucher. The prize is won by skill ranking — not a random draw, and never guaranteed.",
    personalized: "For you",
    noWinners: "No verified winners published yet.",
    noCampaigns: "No campaigns to show right now.",
    skillBased: "Skill-based challenge",
    notALottery: "Not a lottery • Not a guaranteed win",
    language: "العربية",
  },
  ar: {
    brand: "سوبر ميغا برومو",
    demoBadge: "بيانات تجريبية — محاكاة",
    navHome: "الرئيسية",
    navCampaigns: "الحملات",
    navWinners: "الفائزون",
    navAccount: "حسابي",
    navAdmin: "الإدارة",
    navInvestor: "المستثمر",
    howItWorks: "كيف تعمل SMP",
    step1: "اشترِ قيمة تاجر",
    step2: "استلم القسيمة",
    step3: "العب تحدي المهارة",
    step4: "تنافس على الجائزة",
    activeCampaigns: "الحملات النشطة",
    upcoming: "قريباً",
    recentWinners: "فائزون موثّقون",
    leaderboards: "لوحات المتصدرين",
    viewAll: "عرض الكل",
    viewLeaderboard: "عرض اللوحة كاملة",
    enterNow: "شارك الآن",
    notifyMe: "أبلغني",
    price: "تدفع",
    voucher: "قسيمة تاجر",
    prize: "الجائزة الكبرى",
    deadline: "الموعد النهائي",
    status: "الحالة",
    provisional: "مؤقتة",
    trustTitle: "قيمة تاجر حقيقية + مهارة",
    trustBody:
      "كل عملية شراء تتضمن قسيمة تاجر حقيقية. الجائزة تُحسم بترتيب المهارة — ليست سحباً عشوائياً وليست مضمونة.",
    personalized: "لك",
    noWinners: "لا يوجد فائزون منشورون بعد.",
    noCampaigns: "لا توجد حملات للعرض حالياً.",
    skillBased: "تحدي قائم على المهارة",
    notALottery: "ليست يانصيب • الفوز غير مضمون",
    language: "English",
  },
} as const;

export type DictKey = keyof typeof dict.en;

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictKey) => string;
  dir: "ltr" | "rtl";
}>({
  locale: "en",
  setLocale: () => {},
  t: (k) => dict.en[k],
  dir: "ltr",
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("smp-locale") as Locale | null;
    if (saved === "ar" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem("smp-locale", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: DictKey) => dict[locale][key] ?? dict.en[key],
      dir: (locale === "ar" ? "rtl" : "ltr") as "ltr" | "rtl",
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function tr(locale: Locale, en: string, ar?: string | null) {
  return locale === "ar" && ar ? ar : en;
}
