export type Locale = "en" | "ar";

export function tr(locale: Locale, en: string, ar?: string | null) {
  return locale === "ar" && ar ? ar : en;
}

const nba = {
  en: {
    play: "Play your unused attempt",
    replay: "Claim replay offer",
    purchase: "Enter campaign",
    browse: "Browse campaigns",
  },
  ar: {
    play: "العب محاولتك غير المستخدمة",
    replay: "احصل على عرض إعادة اللعب",
    purchase: "ادخل الحملة",
    browse: "تصفح الحملات",
  },
} as const;

export function nbaLabel(locale: Locale, action: string): string {
  const key =
    action === "play"
      ? "play"
      : action === "replay"
        ? "replay"
        : action === "purchase"
          ? "purchase"
          : "browse";
  return nba[locale][key];
}
