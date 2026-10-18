# Super Mega Promo (SMP)

Investor prototype: multi-campaign mega-promotion portal for Egypt (web-first, bilingual-ready).  
**Demo only — simulated OTP, payments, vouchers, and CRM. No real charges.**

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Prisma + **PostgreSQL** for production (Vercel); **SQLite** still supported for local-only demos
- Vitest for unit/integration-style rule tests
- Recharts for BI charts

## Quick start (local SQLite)

```bash
npm install
# In prisma/schema.prisma set: provider = "sqlite"
cp .env.example .env
# DATABASE_URL="file:./dev.db"
npm run setup          # prisma db push + seed
npm run dev            # http://localhost:3000
```

### Other commands

```bash
npm run test           # vitest
npm run build          # prisma generate + next build
npm run db:reset       # wipe + reseed deterministic demo
npm run db:seed        # reseed only
npm run db:deploy      # postgres: db push + seed (production/shared)
```

## Production (Vercel + Postgres)

1. Create a Postgres database (Neon free tier or Vercel Postgres) and copy the connection string.
2. Import this GitHub repo in [Vercel](https://vercel.com/new) **or** CLI: `npx vercel link` then `npx vercel --prod`.
3. Set environment variables (Production + Preview):

| Name | Example |
|------|---------|
| `DATABASE_URL` | `postgresql://…?sslmode=require` |
| `NEXT_PUBLIC_APP_NAME` | `Super Mega Promo` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` |
| `DEMO_ADMIN_PHONE` | `+201000000001` |
| `DEMO_OTP_CODE` | `123456` |

4. After first deploy (or locally with prod `DATABASE_URL`): `npm run db:deploy` to push schema + seed demo data. Optionally change Vercel **Build Command** to `prisma generate && prisma db push && tsx prisma/seed.ts && next build` so every deploy reseeds the demo.

`vercel.json` defaults to `prisma generate && next build` so builds succeed once `DATABASE_URL` is present for the Prisma client.

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
