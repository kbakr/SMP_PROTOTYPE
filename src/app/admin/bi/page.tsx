import { prisma } from "@/lib/db";
import { campaignEconomics, unitContribution } from "@/lib/economics";
import { Section, Metric, Badge } from "@/components/ui";
import { formatEGP } from "@/lib/utils";
import Link from "next/link";
import { BiCharts } from "./BiCharts";

export const dynamic = "force-dynamic";

export default async function BiPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { homeSortOrder: "asc" } });
  const txs = await prisma.transaction.findMany({
    where: { status: "succeeded" },
    include: { offer: true, campaign: true },
  });
  const events = await prisma.customerEvent.findMany({
    where: { type: { in: ["lp_click", "lp_view", "otp_verified"] } },
  });

  const byCampaign = campaigns.map((c) => {
    const ctx = txs.filter((t) => t.campaignId === c.id);
    const summary = campaignEconomics({
      transactions: ctx.map((t) => ({
        amount: t.amount,
        voucherFaceValue: t.voucherValue,
        isNewPayer: t.isFirstPayer,
        refunded: t.refunded,
      })),
      visitors: events.filter((e) => e.campaignId === c.id).length || ctx.length * 12,
      leads: Math.max(ctx.length, events.filter((e) => e.campaignId === c.id && e.type === "otp_verified").length),
      prizeRegulatoryCost: c.prizeCostWorking || undefined,
    });
    return { campaign: c, summary, txs: ctx };
  });

  const standardUnit = unitContribution({
    amount: 500,
    voucherFaceValue: 500,
    isNewPayer: true,
  });
  const promoUnit = unitContribution({
    amount: 350,
    voucherFaceValue: 500,
    isNewPayer: true,
  });

  const chartData = byCampaign.map(({ campaign, summary }) => ({
    name: campaign.name.slice(0, 18),
    revenue: summary.revenue,
    contribution: Math.round(summary.contributionTotal),
  }));

  return (
    <Section title="Executive BI" subtitle="Derived from financial records · illustrative planning assumptions">
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin" className="text-sm font-bold text-rose-700">
          ← Admin
        </Link>
        <Badge tone="demo">Simulated / Projected</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Std unit contribution (EGP500)" value={formatEGP(Math.round(standardUnit.contribution))} hint="Never apply to promo txs" />
        <Metric label="Promo unit contribution (EGP350)" value={formatEGP(Math.round(promoUnit.contribution))} hint="Recalculated separately" />
        <Metric label="Break-even payers (std)" value={String(byCampaign[0]?.summary.breakEvenPayers ?? "—")} />
        <Metric label="Break-even gross (std)" value={formatEGP(byCampaign[0]?.summary.breakEvenGross ?? 0)} />
      </div>

      <div className="mt-8">
        <BiCharts data={chartData} />
      </div>

      <div className="mt-8 space-y-4">
        {byCampaign.map(({ campaign, summary }) => (
          <article key={campaign.id} className="rounded-3xl bg-white/85 p-5">
            <h3 className="font-display text-2xl">{campaign.name}</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6 text-sm">
              <div>Txs: {summary.transactions}</div>
              <div>Revenue: {formatEGP(summary.revenue)}</div>
              <div>Voucher face: {formatEGP(summary.voucherFaceTotal)}</div>
              <div>Contribution: {formatEGP(Math.round(summary.contributionTotal))}</div>
              <div>Fixed (working): {formatEGP(summary.conservativeFixed)}</div>
              <div>Op. profit: {formatEGP(Math.round(summary.operatingProfit))}</div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
