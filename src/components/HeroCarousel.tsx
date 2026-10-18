"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEGP } from "@/lib/utils";
import { Badge } from "./ui";
import type { CampaignCardData } from "./CampaignCard";

export function HeroCarousel({
  campaigns,
  locale = "en",
}: {
  campaigns: CampaignCardData[];
  locale?: string;
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (campaigns.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % campaigns.length), 5500);
    return () => clearInterval(t);
  }, [campaigns.length]);

  if (!campaigns.length) {
    return (
      <div className="hero-mesh mx-auto flex min-h-[70vh] w-full items-center justify-center px-4 text-white">
        <p className="font-display text-3xl">No featured campaigns right now.</p>
      </div>
    );
  }

  const c = campaigns[idx];
  const prize = locale === "ar" && c.prize?.nameAr ? c.prize.nameAr : c.prize?.name;
  const name = locale === "ar" && c.nameAr ? c.nameAr : c.name;

  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={c.heroImageUrl || c.cardImageUrl || c.prize?.imageUrl || "/prizes/phone.svg"}
          alt={prize || name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-rose-950/55 to-teal-900/40" />
      </div>
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
        <div className="max-w-2xl animate-floaty">
          <p className="mb-3 font-display text-4xl font-semibold tracking-tight text-white drop-shadow sm:text-6xl md:text-7xl">
            Super Mega Promo
          </p>
          <Badge tone="demo">Demo · Simulated payments</Badge>
          <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-5xl">
            {name}
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">
            Compete for <strong>{prize}</strong>. You pay{" "}
            <strong>{formatEGP(c.standardPrice, locale)}</strong> and receive a genuine{" "}
            <strong>{formatEGP(c.standardVoucherValue, locale)}</strong>
            {c.merchant ? ` ${c.merchant.name}` : ""} voucher — then one timed skill challenge.
            Win is never guaranteed.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/campaigns/${c.slug}`}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-rose-700 shadow-xl"
            >
              Enter this campaign
            </Link>
            <Link
              href="/campaigns"
              className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur"
            >
              Browse all
            </Link>
          </div>
        </div>
        {campaigns.length > 1 ? (
          <div className="mt-8 flex gap-2">
            {campaigns.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Featured campaign ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-2.5 rounded-full transition-all ${i === idx ? "w-10 bg-white" : "w-2.5 bg-white/40"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
