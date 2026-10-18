import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LinkButton, Badge, Section } from "@/components/ui";
import { formatEGP } from "@/lib/utils";
import { LpTracker } from "./LpTracker";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lp = await prisma.landingPage.findUnique({
    where: { slug },
    include: {
      campaign: { include: { prize: true, merchant: true, offers: true } },
      partner: true,
      offer: true,
    },
  });
  if (!lp || !lp.active) notFound();

  const offer =
    lp.offer ||
    lp.campaign.offers.find((o) => o.offerType === "standard") ||
    lp.campaign.offers[0];
  const canBuy = lp.campaign.status === "Live";

  return (
    <div>
      <LpTracker slug={lp.slug} />
      <section className="relative min-h-[70vh] overflow-hidden">
        <Image
          src={lp.creativeUrl || lp.campaign.heroImageUrl || "/prizes/phone.svg"}
          alt={lp.headline || lp.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-rose-900/50" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
          <Badge tone="demo">Acquisition LP · not the portal homepage</Badge>
          <h1 className="mt-4 max-w-2xl font-display text-4xl text-white sm:text-6xl">
            {lp.headline || lp.campaign.name}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">
            {lp.subheadline || lp.campaign.tagline}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-white">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <div className="text-xs uppercase">Prize</div>
              <div className="font-semibold">{lp.campaign.prize?.name}</div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <div className="text-xs uppercase">You pay</div>
              <div className="font-semibold">{formatEGP(offer?.purchasePrice ?? lp.campaign.standardPrice)}</div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <div className="text-xs uppercase">Voucher</div>
              <div className="font-semibold">
                {formatEGP(offer?.voucherValue ?? lp.campaign.standardVoucherValue)}
              </div>
            </div>
          </div>
          <div className="mt-8">
            {canBuy ? (
              <LinkButton
                href={`/campaigns/${lp.campaign.slug}/identify?offer=${offer?.code || "STD500"}&lp=${lp.slug}`}
              >
                Continue
              </LinkButton>
            ) : (
              <span className="rounded-xl bg-slate-700 px-5 py-3 text-sm text-white">
                Campaign not open for purchase
              </span>
            )}
          </div>
          <p className="mt-4 text-xs text-white/70">
            Partner: {lp.partner?.name || "direct"} · Source {lp.utmSource}/{lp.utmMedium}
          </p>
        </div>
      </section>
      <Section title="This is an acquisition landing page">
        <p className="text-slate-600">
          Attribution from this LP is preserved through checkout. The multi-campaign portal homepage is
          separate at <code>/</code>.
        </p>
      </Section>
    </div>
  );
}
