# SMP Implementation Status

**Updated:** 2026-10-18  
**App root:** repository root (also published on GitHub)  
**Stack:** Next.js 15 · TypeScript · Tailwind v4 · Prisma · SQLite (local) / **PostgreSQL (production via Neon on Vercel)**  
**Status:** Local demo verified · Published to GitHub · **Live on Vercel production** · AR depth + admin campaign builder landed

## Hosting / Vercel

- **Production URL:** https://smp-prototype.vercel.app  
- **Project dashboard:** https://vercel.com/kbakr-smp/smp-prototype  
- **Team / project:** `kbakr-smp` / `smp-prototype`  
- **Git:** connected to https://github.com/kbakr/SMP_PROTOTYPE (`main`)  
- **Database:** Neon Postgres (Vercel Marketplace `free_v3`), schema pushed + demo seeded (`db:deploy`)  
- **Verified 200:** `/`, `/campaigns`, `/winners`, `/investor`, `/admin`, `/lp/ig-influencer-a-phone`  
- **Repo config on `main`:** `vercel.json` (`prisma generate && next build`), Prisma `provider = "postgresql"`, `.npmrc`, `npm run db:deploy`  
- **After this polish:** redeploy picks up AR + builder UI; run `npm run db:deploy` (or `prisma db push`) once so Neon gets `Question.optionsAr`

## GitHub remote

- **Live repo:** https://github.com/kbakr/SMP_PROTOTYPE  
- **Branch:** `main` (feature work may land via PR then merge)  
- **Confirmed on GitHub:** `package.json`, `README.md`, `IMPLEMENTATION_STATUS.md`, plus `src/`, `prisma/`, `tests/`  

## How to run

```bash
git clone https://github.com/kbakr/SMP_PROTOTYPE.git
cd SMP_PROTOTYPE
npm install
# Local SQLite: set prisma provider to "sqlite" and DATABASE_URL=file:./dev.db
npm run setup    # db push + seed
npm run dev      # http://localhost:3000
npm run test
npm run build && npm run start
```

Demo OTP: `123456` · See README for persona phones.

## Phase completion

| Phase | Scope | Status |
|-------|--------|--------|
| 0 | Next.js scaffold, env, README, tooling | Done |
| 1 | Schema, seed, rules, economics, i18n, reset | Done |
| 2 | Portal home, directory, detail, LB, winners, LPs, admin visibility | Done |
| 3 | Golden path OTP → offer → checkout → voucher → play → result | Done |
| 4 | Admin, Customer360, CRM segments/waves, attribution | Done (working prototype depth) |
| 5 | BI economics + charts from financial records | Done |
| 6 | Investor Mode + white-label theme toggle | Done |
| 7 | Tests, RTL toggle, empty states, docs | Done (core) |
| 7b | Deeper AR + admin campaign builder | **Done (this pass)** |

## Verified

- `npm run test` — **19/19 passed** (local; +6 campaign-builder / i18n helper tests)
- `npm run build` — success (local)
- Local smoke: `/`, `/campaigns`, `/admin`, `/admin/campaigns/new` **200**; builder POST/PUT create+edit with 5Q + `*Ar`
- Vercel production smoke (pre-polish): homepage and key routes **200**; demo OTP API accepts phone+code
- Seed: Campaigns A/B Live, C Scheduled, past Closed; bilingual prompts/options; Ahmed golden path
- No real payment/OTP/SMS providers
- GitHub publish — **pass**

## What works (demo)

- Colorful multi-campaign portal homepage (hero carousel, active/upcoming, winners, per-campaign LB previews, how-it-works, trust)
- Campaign cards show **distinct** prize / price / voucher / status / CTA
- Acquisition LPs distinct from homepage; attribution touch recorded
- End-to-end simulated purchase with **voucher before attempt**
- Challenge: 5Q / 60s, server timestamps, recomputed ranks, campaign isolation
- Account NBA (play unused attempt first) with EN/AR labels
- Admin visibility controls reflected on portal listings
- **Admin campaign builder** (`/admin/campaigns/new`, `/admin/campaigns/[id]`): create/edit campaign copy EN/AR, prize, commercial defaults (500/500, max 5, 5Q/60s), questions + options EN/AR; POST/PUT `/api/admin/campaigns`; visibility PATCH unchanged
- Customer360 + CRM wave attribution display + BI contribution (promo ≠ standard unit math)
- Investor guided tour
- **EN/AR language toggle** with expanded dictionary on home, directory, detail, play (prompt+options), checkout flow, account, winners, leaderboard, footer; RTL + Cairo font; campaign `*Ar` / `optionsAr` used when locale is AR

## What’s left / limitations

- Landing pages (`/lp/*`) and investor tour copy still thinner in AR than portal core
- Offer names remain English codes/labels (no `Offer.*Ar` fields)
- Segment builder is display + seeded rules JSON, not a full visual AND/OR editor
- Challenge UX is sequential but not deeply animated; no platform-fault free-retry UI beyond data model
- Local SQLite still available by flipping Prisma `provider` (see README / DECISIONS.md)
- Automated e2e browser tests not included (unit tests cover rules + builder validation)
- Production Neon needs a one-time schema push for `optionsAr` after deploy

## Acceptance criteria map

1. Multi-campaign homepage cards — **pass**  
2. Admin feature/reorder/show-hide — **pass**  
3. Hidden completed keeps history — **pass** (past campaign + winner)  
4. Independent detail/LB/winners — **pass**  
5. Multi-LP attribution — **pass**  
6. Empty/missing winners graceful — **pass**  
7. Ahmed golden path persistent — **pass** (seeded + live replayable)  
8. Ranking computed — **pass** (tested)  
9. CRM + consent surfaces — **pass** (simulated)  
10. Economics from records — **pass** (tested)  
11. Investor labeled + theme — **pass**  
12. AR/EN + responsive — **pass** (portal core + RTL; LP/investor still thinner)  
13. Demo labeling / no real charges — **pass**  
14. Automated tests — **pass** (19)  
15. Admin campaign builder UI — **pass** (create/edit prizes + questions)

## Media

Screenshots under project store:  
`/cursor/stores/bc-01a14fe5-a9b1-7439-a682-e90c45cce73d/media/`
