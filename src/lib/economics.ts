import { RULES } from "./business-rules";

export type TransactionEconomicsInput = {
  amount: number;
  voucherFaceValue: number;
  voucherCost?: number;
  isNewPayer: boolean;
  refunded?: boolean;
  partnerCommissionPct?: number;
};

export type UnitEconomics = {
  gross: number;
  providerPayout: number;
  vat: number;
  voucherCost: number;
  paymentFeeEstimate: number;
  refundReserve: number;
  cpa: number;
  partnerCommission: number;
  contribution: number;
};

/** Per-transaction contribution — NEVER apply EGP500 unit math to discounted offers */
export function unitContribution(tx: TransactionEconomicsInput): UnitEconomics {
  const gross = tx.refunded ? 0 : tx.amount;
  const providerPayout = gross * RULES.providerPayoutRate;
  const vat = gross * (RULES.vatRate / (1 + RULES.vatRate)); // extract VAT portion working approx
  const voucherCost = tx.refunded ? 0 : (tx.voucherCost ?? RULES.voucherCostWorking);
  const paymentFeeEstimate = gross * (1 - RULES.providerPayoutRate);
  const refundReserve = gross * RULES.refundReserveRate;
  const cpa = tx.isNewPayer && !tx.refunded ? RULES.cpaNewPayer : 0;
  const partnerCommission =
    !tx.refunded && tx.partnerCommissionPct
      ? gross * (tx.partnerCommissionPct / 100)
      : 0;

  // Working contribution: net payout - voucher cost - refund reserve - CPA - partner commission
  // VAT shown separately for planning transparency
  const contribution =
    providerPayout - voucherCost - refundReserve - cpa - partnerCommission;

  return {
    gross,
    providerPayout,
    vat,
    voucherCost,
    paymentFeeEstimate,
    refundReserve,
    cpa,
    partnerCommission,
    contribution,
  };
}

export type CampaignEconomicsSummary = {
  visitors: number;
  leads: number;
  payers: number;
  transactions: number;
  revenue: number;
  voucherFaceTotal: number;
  voucherCostTotal: number;
  contributionTotal: number;
  avgContribution: number;
  prizeRegulatoryCost: number;
  operatingCeiling: number;
  conservativeFixed: number;
  operatingProfit: number;
  breakEvenPayers: number;
  breakEvenTransactions: number;
  breakEvenGross: number;
  breakEvenVisitorsAt10pct: number;
  standardUnitContribution: number;
};

export function campaignEconomics(opts: {
  transactions: TransactionEconomicsInput[];
  visitors?: number;
  leads?: number;
  prizeRegulatoryCost?: number;
  operatingCeiling?: number;
}): CampaignEconomicsSummary {
  const units = opts.transactions.map(unitContribution);
  const revenue = units.reduce((s, u) => s + u.gross, 0);
  const contributionTotal = units.reduce((s, u) => s + u.contribution, 0);
  const voucherFaceTotal = opts.transactions
    .filter((t) => !t.refunded)
    .reduce((s, t) => s + t.voucherFaceValue, 0);
  const voucherCostTotal = units.reduce((s, u) => s + u.voucherCost, 0);
  const txCount = opts.transactions.filter((t) => !t.refunded).length;
  const distinctNew = opts.transactions.filter((t) => t.isNewPayer && !t.refunded).length;
  const prizeRegulatoryCost = opts.prizeRegulatoryCost ?? RULES.prizeRegulatoryWorking;
  const operatingCeiling = opts.operatingCeiling ?? RULES.operatingCeiling;
  const conservativeFixed = prizeRegulatoryCost + operatingCeiling;
  const operatingProfit = contributionTotal - conservativeFixed;

  const standardUnit = unitContribution({
    amount: RULES.standardPrice,
    voucherFaceValue: RULES.standardVoucherValue,
    isNewPayer: true,
  });

  const breakEvenPayers =
    standardUnit.contribution > 0
      ? Math.ceil(conservativeFixed / standardUnit.contribution)
      : 0;
  const breakEvenTransactions = Math.ceil(breakEvenPayers * RULES.purchasesPerCustomer);
  const breakEvenGross = breakEvenTransactions * RULES.standardPrice;
  const breakEvenVisitorsAt10pct = Math.ceil(breakEvenPayers / 0.1);

  return {
    visitors: opts.visitors ?? 0,
    leads: opts.leads ?? 0,
    payers: distinctNew || txCount,
    transactions: txCount,
    revenue,
    voucherFaceTotal,
    voucherCostTotal,
    contributionTotal,
    avgContribution: txCount ? contributionTotal / txCount : 0,
    prizeRegulatoryCost,
    operatingCeiling,
    conservativeFixed,
    operatingProfit,
    breakEvenPayers,
    breakEvenTransactions,
    breakEvenGross,
    breakEvenVisitorsAt10pct,
    standardUnitContribution: standardUnit.contribution,
  };
}
