# Super Mega Promo (SMP)

Investor prototype: multi-campaign mega-promotion portal for Egypt (web-first, bilingual-ready).  
**Demo only — simulated OTP, payments, vouchers, and CRM. No real charges.**

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Prisma + SQLite (`file:./dev.db`) — switch `DATABASE_URL` to PostgreSQL when ready
- Vitest for unit/integration-style rule tests
- Recharts for BI charts

## Quick start

```bash
npm install
cp .env.example .env   # if needed
npm run setup          # prisma db push + seed
npm run dev            # http://localhost:3000
```

### Other commands

```bash
npm run test           # vitest
npm run build          # production build
npm run db:reset       # wipe + reseed deterministic demo
npm run db:seed        # reseed only
```

## Demo identities

| Persona | Phone | Notes |
|---------|-------|--------|
| Ahmed Hassan | `+201111111111` | Golden path: LP → abandon → CRM → EGP350 → 4/5 in 38.42s |
| Mariam Adel | `+201222222222` | Checkout abandoner |
| Omar Khaled | `+201333333333` | Voucher + unused attempt (NBA = play) |
| Sara Mahmoud | `+201444444444` | Cross-campaign high LTV |
| Demo Admin | `+201000000001` | OTP → admin session role |

**Demo OTP:** `123456` (from `.env`)

### Useful URLs

- `/` — colorful multi-campaign portal homepage
- `/campaigns` — directory filters
- `/lp/ig-influencer-a-phone` — Influencer A acquisition LP
- `/lp/crm-recover-phone` — CRM recovery LP (EGP350)
- `/admin` — visibility / modules / reset demo
- `/admin/customers` — Customer360
- `/admin/crm` — segments & waves
- `/admin/bi` — economics
- `/investor` — guided investor mode
- `/account` — personalized hub

## Commercial rules (do not alter)

Customer pays for a **genuine merchant voucher** + one skill attempt. Prize is competed for — never purchased, never guaranteed. Ranking: score DESC, time ASC, earliest valid attempt ASC. Max 5 purchases/attempts per person per campaign. Voucher issued **before** challenge access.

See `IMPLEMENTATION_STATUS.md` and `DECISIONS.md`.
