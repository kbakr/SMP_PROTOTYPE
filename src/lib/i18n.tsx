"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { nbaLabel as nbaLabelHelper, tr as trHelper, type Locale } from "./i18n-helpers";

export type { Locale };

const dict = {
  en: {
    brand: "Super Mega Promo",
    brandTagline: "Egypt · Skill · Value",
    demoBadge: "Demo Data — Simulated",
    navHome: "Home",
    navCampaigns: "Campaigns",
    navWinners: "Winners",
    navAccount: "My Account",
    navAdmin: "Admin",
    navInvestor: "Investor",
    howItWorks: "How SMP Works",
    howItWorksSub:
      "Transparent skill promotions with merchant value first — never framed as buying the prize.",
    step1: "Buy merchant value",
    step1Body: "Pay the campaign price for a genuine voucher.",
    step2: "Receive voucher",
    step2Body: "Issued after simulated payment — before you play.",
    step3: "Play skill challenge",
    step3Body: "5 questions · 60 seconds · answers are final.",
    step4: "Compete for prize",
    step4Body: "Ranked by score, then time. No random draw.",
    activeCampaigns: "Active campaigns",
    activeSub:
      "Each card shows prize, price, voucher value, deadline, and CTA — independently configured.",
    upcoming: "Coming soon",
    upcomingSub: "Register interest — consent required for notify.",
    recentWinners: "Verified winners",
    winnersSub: "Privacy-safe display · demo data clearly labeled.",
    leaderboards: "Campaign leaderboards",
    leaderboardsSub: "Each preview is campaign-specific — no cross-campaign mix.",
    viewAll: "View all",
    viewLeaderboard: "View full leaderboard",
    fullBoard: "Full board →",
    enterNow: "Enter now",
    notifyMe: "Notify me",
    price: "You pay",
    voucher: "Merchant voucher",
    prize: "Hero prize",
    prizeLabel: "Prize",
    deadline: "Deadline",
    status: "Status",
    provisional: "Provisional",
    trustTitle: "Merchant value & trust",
    trustHeadline: "Real voucher. Skill ranking. Clear terms.",
    trustBody:
      "Purchase price and voucher value are configured independently per offer. A purchase never buys the prize and never guarantees a win. Production participation requires Egyptian legal, payment and merchant sign-offs — this build uses simulated integrations only.",
    ageBadge: "18+",
    maxAttemptsBadge: "Max 5 attempts / campaign",
    exampleStandard: "Example standard",
    personalized: "For you",
    noWinners: "No verified winners published yet.",
    noCampaigns: "No campaigns to show right now.",
    noLiveHome: "No live campaigns on the homepage right now.",
    noUpcoming: "No upcoming campaigns scheduled for display.",
    noLeaderboards: "No leaderboards to preview.",
    noRankedYet: "No ranked attempts yet.",
    noFeatured: "No featured campaigns right now.",
    skillBased: "Skill-based challenge",
    notALottery: "Not a lottery • Not a guaranteed win",
    skillWinNote: "Skill-based · Win not guaranteed",
    language: "العربية",
    enterCampaign: "Enter this campaign",
    browseAll: "Browse all",
    heroCompete: "Compete for",
    heroPayReceive: "You pay",
    heroThen: "and receive a genuine",
    heroVoucherThen: "voucher — then one timed skill challenge. Win is never guaranteed.",
    demoSimPayments: "Demo · Simulated payments",
    demoWinner: "Demo winner",
    directoryTitle: "Campaign directory",
    directorySub: "Admin visibility controls what appears here — hidden campaigns keep their history.",
    filterAll: "All visible",
    filterActive: "Active",
    filterUpcoming: "Upcoming",
    filterCompleted: "Completed",
    noFilterMatch: "No campaigns match this filter.",
    leaderboardLink: "Leaderboard",
    prizePriceVoucher: "Prize, price & voucher",
    competedNotPurchased: "Competed for — not purchased",
    offersMayDiffer:
      "Personalized offers may differ (e.g. EGP350) — price and voucher value are independent.",
    purchasesClosed: "Purchases closed",
    purchaseCutoff: "Purchase cutoff",
    maxAttempts: "Max attempts",
    rules: "Rules",
    skillNotLottery: "Skill-based · Not a lottery · Win not guaranteed",
    topRanks: "top ranks",
    provisionalUntil: "Provisional until winner verification",
    campaignUnavailable: "Campaign unavailable for new entries",
    campaignUnavailableBody:
      "This campaign is closed or hidden from listings. Historical leaderboard and winners may still be available if enabled. No new purchases after cutoff.",
    identifyTitle: "Identify yourself",
    identifySub: "Demo OTP only — no real SMS. Use a persona phone or any +20 number.",
    phone: "Phone",
    sendOtp: "Send demo OTP",
    verifyContinue: "Verify & continue",
    otpCode: "OTP code",
    offerTitle: "Your offer",
    offerSub: "Price and voucher value are independent. Prize is never purchased.",
    continueCheckout: "Continue to checkout",
    checkoutTitle: "Simulated checkout",
    checkoutSub: "No real payment provider. Success issues voucher before challenge access.",
    paySuccess: "Pay successfully (demo)",
    payFail: "Simulate failure",
    abandonCheckout: "Abandon checkout",
    successTitle: "Voucher issued",
    successSub: "You received merchant value before the skill challenge.",
    playChallenge: "Play challenge",
    voucherCode: "Voucher code",
    playTitle: "Skill challenge",
    playSub: "5 questions · one continuous timer · answers final · no live correctness feedback",
    playReady:
      "Timer starts on the server when you begin. Leaving the page does not pause a started attempt.",
    startChallenge: "Start 60-second challenge",
    noUnusedAttempt: "No unused attempt. Purchase first.",
    resultTitle: "Challenge result",
    resultSub: "Score and time determine rank within this campaign only.",
    yourScore: "Your score",
    yourTime: "Your time",
    yourRank: "Your rank",
    backToCampaign: "Back to campaign",
    notifyTitle: "Notify me",
    notifySub: "Register interest for this upcoming campaign. Consent required.",
    emailOptional: "Email (optional)",
    consentNotify: "I consent to be notified about this campaign",
    submitInterest: "Submit interest",
    lbTitle: "Leaderboard",
    lbSub: "Provisional ranks · campaign-isolated",
    winnersTitle: "Verified winners",
    winnersPageSub: "Published winners only · privacy-safe masking · demo labeled",
    accountTitle: "My Account",
    accountSub: "Personalized hub · demo identities",
    loadDemo: "Load demo customer",
    signInHint: "Sign in via campaign OTP or load a demo phone above.",
    nextBestActions: "Next best actions",
    go: "Go →",
    myCampaigns: "Campaigns",
    myVouchers: "Vouchers",
    nbaPlay: "Play your unused attempt",
    nbaReplay: "Claim replay offer",
    nbaPurchase: "Enter campaign",
    nbaBrowse: "Browse campaigns",
    footerDemo:
      "Demo prototype. No real payments, OTP providers, or KYC. All winners and economics are labeled demo/simulated.",
    adminBuilder: "Campaign builder",
    adminVisibility: "Visibility",
  },
  ar: {
    brand: "سوبر ميغا برومو",
    brandTagline: "مصر · مهارة · قيمة",
    demoBadge: "بيانات تجريبية — محاكاة",
    navHome: "الرئيسية",
    navCampaigns: "الحملات",
    navWinners: "الفائزون",
    navAccount: "حسابي",
    navAdmin: "الإدارة",
    navInvestor: "المستثمر",
    howItWorks: "كيف تعمل SMP",
    howItWorksSub: "عروض مهارة شفافة بقيمة التاجر أولاً — دون تصوير الشراء كشراء للجائزة.",
    step1: "اشترِ قيمة تاجر",
    step1Body: "ادفع سعر الحملة مقابل قسيمة حقيقية.",
    step2: "استلم القسيمة",
    step2Body: "تُصدر بعد الدفع المحاكى — قبل اللعب.",
    step3: "العب تحدي المهارة",
    step3Body: "٥ أسئلة · ٦٠ ثانية · الإجابات نهائية.",
    step4: "تنافس على الجائزة",
    step4Body: "الترتيب حسب الدرجة ثم الوقت. بلا سحب عشوائي.",
    activeCampaigns: "الحملات النشطة",
    activeSub: "كل بطاقة تعرض الجائزة والسعر وقيمة القسيمة والموعد وزر الإجراء — بشكل مستقل.",
    upcoming: "قريباً",
    upcomingSub: "سجّل اهتمامك — يلزم الموافقة للإشعار.",
    recentWinners: "فائزون موثّقون",
    winnersSub: "عرض يحفظ الخصوصية · بيانات تجريبية واضحة.",
    leaderboards: "لوحات المتصدرين",
    leaderboardsSub: "كل معاينة خاصة بحملة — بلا خلط بين الحملات.",
    viewAll: "عرض الكل",
    viewLeaderboard: "عرض اللوحة كاملة",
    fullBoard: "اللوحة كاملة ←",
    enterNow: "شارك الآن",
    notifyMe: "أبلغني",
    price: "تدفع",
    voucher: "قسيمة تاجر",
    prize: "الجائزة الكبرى",
    prizeLabel: "الجائزة",
    deadline: "الموعد النهائي",
    status: "الحالة",
    provisional: "مؤقتة",
    trustTitle: "قيمة التاجر والثقة",
    trustHeadline: "قسيمة حقيقية. ترتيب مهارة. شروط واضحة.",
    trustBody:
      "سعر الشراء وقيمة القسيمة يُضبطان بشكل مستقل لكل عرض. الشراء لا يشتري الجائزة ولا يضمن الفوز. المشاركة الإنتاجية تتطلب موافقات قانونية ومدفوعات وتاجر في مصر — هذا البناء يستخدم تكاملات محاكاة فقط.",
    ageBadge: "+١٨",
    maxAttemptsBadge: "بحد أقصى ٥ محاولات / حملة",
    exampleStandard: "مثال قياسي",
    personalized: "لك",
    noWinners: "لا يوجد فائزون منشورون بعد.",
    noCampaigns: "لا توجد حملات للعرض حالياً.",
    noLiveHome: "لا توجد حملات مباشرة على الصفحة الرئيسية الآن.",
    noUpcoming: "لا توجد حملات قادمة معروضة.",
    noLeaderboards: "لا توجد لوحات للمعاينة.",
    noRankedYet: "لا توجد محاولات مرتّبة بعد.",
    noFeatured: "لا توجد حملات مميزة الآن.",
    skillBased: "تحدي قائم على المهارة",
    notALottery: "ليست يانصيب • الفوز غير مضمون",
    skillWinNote: "قائم على المهارة · الفوز غير مضمون",
    language: "English",
    enterCampaign: "ادخل هذه الحملة",
    browseAll: "تصفح الكل",
    heroCompete: "تنافس على",
    heroPayReceive: "تدفع",
    heroThen: "وتستلم قسيمة حقيقية بقيمة",
    heroVoucherThen: "— ثم تحدي مهارة موقوت واحد. الفوز غير مضمون أبداً.",
    demoSimPayments: "تجريبي · مدفوعات محاكاة",
    demoWinner: "فائز تجريبي",
    directoryTitle: "دليل الحملات",
    directorySub: "ضوابط ظهور الإدارة تحدد ما يظهر هنا — الحملات المخفية تحتفظ بسجلها.",
    filterAll: "كل الظاهر",
    filterActive: "نشطة",
    filterUpcoming: "قادمة",
    filterCompleted: "مكتملة",
    noFilterMatch: "لا توجد حملات تطابق هذا التصفية.",
    leaderboardLink: "لوحة المتصدرين",
    prizePriceVoucher: "الجائزة والسعر والقسيمة",
    competedNotPurchased: "للمنافسة — ليست للشراء",
    offersMayDiffer:
      "قد تختلف العروض المخصصة (مثل ٣٥٠ ج.م) — السعر وقيمة القسيمة مستقلان.",
    purchasesClosed: "المشتريات مغلقة",
    purchaseCutoff: "حد الشراء",
    maxAttempts: "أقصى محاولات",
    rules: "القواعد",
    skillNotLottery: "قائم على المهارة · ليست يانصيب · الفوز غير مضمون",
    topRanks: "أعلى المراتب",
    provisionalUntil: "مؤقتة حتى التحقق من الفائز",
    campaignUnavailable: "الحملة غير متاحة للمشاركات الجديدة",
    campaignUnavailableBody:
      "هذه الحملة مغلقة أو مخفية من القوائم. قد تبقى لوحة المتصدرين والفائزون التاريخيون متاحين إن فُعّلا. لا مشتريات جديدة بعد حد الشراء.",
    identifyTitle: "عرّف بنفسك",
    identifySub: "رمز تحقق تجريبي فقط — بلا رسائل حقيقية. استخدم هاتف شخصية أو أي رقم +20.",
    phone: "الهاتف",
    sendOtp: "أرسل رمز التحقق التجريبي",
    verifyContinue: "تحقق ومتابعة",
    otpCode: "رمز التحقق",
    offerTitle: "عرضك",
    offerSub: "السعر وقيمة القسيمة مستقلان. الجائزة لا تُشترى أبداً.",
    continueCheckout: "متابعة إلى الدفع",
    checkoutTitle: "دفع محاكى",
    checkoutSub: "لا مزوّد دفع حقيقي. النجاح يُصدر القسيمة قبل دخول التحدي.",
    paySuccess: "ادفع بنجاح (تجريبي)",
    payFail: "محاكاة فشل",
    abandonCheckout: "اترك الدفع",
    successTitle: "تم إصدار القسيمة",
    successSub: "استلمت قيمة التاجر قبل تحدي المهارة.",
    playChallenge: "العب التحدي",
    voucherCode: "رمز القسيمة",
    playTitle: "تحدي المهارة",
    playSub: "٥ أسئلة · مؤقت واحد متصل · إجابات نهائية · بلا ملاحظات فورية عن الصحة",
    playReady: "يبدأ المؤقت على الخادم عند البدء. مغادرة الصفحة لا توقف محاولة بدأت.",
    startChallenge: "ابدأ تحدي الـ ٦٠ ثانية",
    noUnusedAttempt: "لا توجد محاولة غير مستخدمة. اشترِ أولاً.",
    resultTitle: "نتيجة التحدي",
    resultSub: "الدرجة والوقت يحددان الترتيب داخل هذه الحملة فقط.",
    yourScore: "درجتك",
    yourTime: "وقتك",
    yourRank: "ترتيبك",
    backToCampaign: "العودة للحملة",
    notifyTitle: "أبلغني",
    notifySub: "سجّل اهتمامك بهذه الحملة القادمة. الموافقة مطلوبة.",
    emailOptional: "البريد (اختياري)",
    consentNotify: "أوافق على إشعاري بشأن هذه الحملة",
    submitInterest: "إرسال الاهتمام",
    lbTitle: "لوحة المتصدرين",
    lbSub: "ترتيب مؤقت · معزول لكل حملة",
    winnersTitle: "فائزون موثّقون",
    winnersPageSub: "الفائزون المنشورون فقط · إخفاء للهوية · مُعلَّم كتجريبي",
    accountTitle: "حسابي",
    accountSub: "مركز مخصص · هويات تجريبية",
    loadDemo: "تحميل عميل تجريبي",
    signInHint: "سجّل الدخول عبر رمز الحملة أو حمّل هاتفاً تجريبياً أعلاه.",
    nextBestActions: "أفضل إجراء تالٍ",
    go: "انطلق ←",
    myCampaigns: "الحملات",
    myVouchers: "القسائم",
    nbaPlay: "العب محاولتك غير المستخدمة",
    nbaReplay: "احصل على عرض إعادة اللعب",
    nbaPurchase: "ادخل الحملة",
    nbaBrowse: "تصفح الحملات",
    footerDemo:
      "نموذج تجريبي. بلا مدفوعات حقيقية أو مزوّدي OTP أو تحقق هوية. كل الفائزين والاقتصاد مُعلَّم كتجريبي/محاكاة.",
    adminBuilder: "منشئ الحملات",
    adminVisibility: "الظهور",
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
  return trHelper(locale, en, ar);
}

export function nbaLabel(locale: Locale, action: string): string {
  return nbaLabelHelper(locale, action);
}
