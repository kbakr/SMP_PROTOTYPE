# Architecture decisions

## Database

- **SQLite via Prisma** for zero-credential local demo (`DATABASE_URL=file:./dev.db`).
- Schema is relational and portable; switch to PostgreSQL by changing `DATABASE_URL` and provider in `prisma/schema.prisma`.

## Auth

- Simulated OTP (`DEMO_OTP_CODE`) + `AppSession` tokens stored client-side for demo flows.
- Explicitly **not** production-secure; labeled throughout UI.

## Integrations

- Payments, SMS/WhatsApp, voucher providers, KYC: **simulated only**.
- Idempotent checkout keys prevent double voucher issuance on retry.

## Ranking

- Server-owned `serverStartAt` / `serverEndAt` for challenge timing.
- Leaderboard recomputed from valid completed attempts; best attempt per customer; campaign-isolated.

## Economics

- Per-transaction `unitContribution`; EGP350 offers never inherit EGP500 unit economics.
- Break-even figures use standard-offer planning assumptions from the master prompt (illustrative).

## i18n

- Client `LocaleProvider` with EN/AR dictionary + `dir` switch.
- Campaign content fields include `*Ar` columns; full copy coverage can expand.

## Imagery

- Placeholder SVG prizes under `/public/prizes` — fictional merchants/brands for demo rights safety.
