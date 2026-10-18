# Architecture decisions

## Database

- **Local demo:** SQLite via Prisma (`DATABASE_URL=file:./dev.db`). Flip `provider` in `prisma/schema.prisma` to `"sqlite"` for zero-credential local runs (`npm run setup`).
- **Production (Vercel):** `provider = "postgresql"` (current default in schema) with hosted Postgres — Neon, Vercel Postgres, or any Prisma-compatible URL in `DATABASE_URL`.
- After setting production `DATABASE_URL`, run once: `npm run db:deploy` (db push + seed), or add that step to the Vercel build command.
- Schema is relational and portable between SQLite and PostgreSQL for this prototype (no engine-specific types).

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

- Client `LocaleProvider` with EN/AR dictionary + `dir` switch; Cairo webfont for RTL body/display.
- Campaign / prize / merchant / question content use `*Ar` columns; question options use bilingual `optionsJson` (`string[]` legacy or `{ en, ar }`) via `src/lib/question-options.ts` — no extra DB column (avoids prod migrate blockers).
- Pure helpers in `src/lib/i18n-helpers.ts` (`tr`, `nbaLabel`) for tests and shared mapping.

## Admin campaign builder

- POST/PUT `/api/admin/campaigns` validate via `validateCampaignBuilderInput` (slug, 5Q, max purchases ≤ 5, positive price/voucher, cutoff from deadline).
- PATCH remains visibility/status-only.
- Question updates upsert by `(campaignId, orderIndex)` so existing challenge responses keep FKs.

## Imagery

- Placeholder SVG prizes under `/public/prizes` — fictional merchants/brands for demo rights safety.

## Hosting

- Target: Vercel (Next.js). SQLite file DB is incompatible with serverless; production requires Postgres.
- Env vars required on Vercel: `DATABASE_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_DEMO_MODE`, `DEMO_ADMIN_PHONE`, `DEMO_OTP_CODE`.
