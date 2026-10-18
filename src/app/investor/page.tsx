"use client";

import { useState } from "react";
import Link from "next/link";
import { Section, Badge, Button, LinkButton } from "@/components/ui";

const STEPS = [
  {
    id: "opportunity",
    title: "Opportunity",
    body: "Egypt-first, web-first mega-promotion destination: many campaigns, genuine merchant vouchers, skill ranking — not a lottery.",
  },
  {
    id: "portal",
    title: "Consumer portal",
    body: "Colorful multi-campaign homepage with featured prizes, directory, winners, and per-campaign leaderboards — admin-managed visibility.",
  },
  {
    id: "flywheel",
    title: "Acquisition + CRM",
    body: "Influencer LPs → OTP → offer → checkout → voucher → challenge. Abandonment recovery and replay offers on shared Customer360 data.",
  },
  {
    id: "economics",
    title: "Connected economics",
    body: "Contribution derived per transaction. EGP350 promo economics recalculated separately from EGP500 standard. Break-even planning labeled illustrative.",
  },
  {
    id: "multi",
    title: "Multiple campaigns",
    body: "Independent prizes, prices, vouchers, and leaderboards. Closed campaigns can hide from home without deleting history.",
  },
  {
    id: "partners",
    title: "Merchant / affiliate streams",
    body: "Voucher face vs cost, partner commission, CPA — simulated in BI. Production needs real merchant and payment sign-offs.",
  },
  {
    id: "whitelabel",
    title: "White-label transformation",
    body: "Same core product with brand theme switch — demo toggle below.",
  },
  {
    id: "scale",
    title: "Multi-country & capital",
    body: "Market entity ready (Egypt seeded). EGP750k development figure is a planning envelope, not a fixed funding ask. Risks: regulatory, payment, prize logistics.",
  },
];

export default function InvestorPage() {
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState<"smp" | "partner">("smp");
  const s = STEPS[step];

  return (
    <div className={theme === "partner" ? "[--smp-rose:#0f766e] filter saturate-150" : ""}>
      <Section
        title="Investor Mode"
        subtitle="Guided business proof · Demo / Simulated / Projected labels throughout"
        action={<Badge tone="demo">Not a live fundraise</Badge>}
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {STEPS.map((st, i) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                i === step ? "bg-slate-900 text-white" : "bg-white/80 text-slate-700"
              }`}
            >
              {i + 1}. {st.title}
            </button>
          ))}
        </div>

        <article className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-rose-900 to-teal-800 p-8 text-white shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">
            Step {step + 1} / {STEPS.length}
          </p>
          <h2 className="mt-3 font-display text-4xl">{s.title}</h2>
          <p className="mt-4 max-w-2xl text-lg text-white/90">{s.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="ghost"
              className="!bg-white !text-slate-900"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              className="!bg-amber-400 !text-slate-900"
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1}
            >
              Next
            </Button>
            {s.id === "portal" ? <LinkButton href="/">Open portal</LinkButton> : null}
            {s.id === "flywheel" ? (
              <LinkButton href="/lp/ig-influencer-a-phone">Ahmed LP</LinkButton>
            ) : null}
            {s.id === "economics" ? <LinkButton href="/admin/bi">Open BI</LinkButton> : null}
            {s.id === "flywheel" ? (
              <LinkButton href="/admin/customers" variant="ghost" className="!text-white !border-white/40">
                Customer360
              </LinkButton>
            ) : null}
          </div>
        </article>

        <div className="mt-8 rounded-3xl bg-white/80 p-6">
          <h3 className="font-display text-xl">White-label theme demo</h3>
          <p className="mt-1 text-sm text-slate-600">
            Switches accent treatment; same product core. {theme === "smp" ? "SMP brand" : "Partner teal brand"}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant={theme === "smp" ? "primary" : "ghost"} onClick={() => setTheme("smp")}>
              SMP theme
            </Button>
            <Button variant={theme === "partner" ? "secondary" : "ghost"} onClick={() => setTheme("partner")}>
              Partner theme
            </Button>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          All figures illustrative. No real regulatory approvals claimed.{" "}
          <Link href="/admin" className="font-semibold text-rose-700">
            Admin
          </Link>
        </p>
      </Section>
    </div>
  );
}
