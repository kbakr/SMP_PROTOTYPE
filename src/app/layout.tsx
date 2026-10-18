import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Super Mega Promo — Demo Portal",
  description:
    "Multi-campaign skill promotions with genuine merchant vouchers. Investor prototype — simulated payments only.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <LocaleProvider>
          <SiteHeader />
          <main>{children}</main>
          <footer className="mt-16 border-t border-white/50 bg-slate-950 text-slate-300">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="font-display text-lg text-white">Super Mega Promo</div>
                <p className="mt-1 max-w-md text-slate-400">
                  Demo prototype. No real payments, OTP providers, or KYC. All winners and economics are
                  labeled demo/simulated.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-slate-300">
                <Link href="/campaigns">Campaigns</Link>
                <Link href="/winners">Winners</Link>
                <Link href="/admin">Admin</Link>
                <Link href="/investor">Investor</Link>
              </div>
            </div>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
