# Deploying secnev on Vercel Hobby

The app is designed to work on the **Hobby** plan without a persistent server or a hosted database.

## How it runs on Vercel

```
public/                     static dashboard (Vercel CDN)
api/v1/*.ts                 one serverless function per route
data/secnev.snapshot.db     read-only SQLite snapshot bundled with the functions
api/cron/ingest.ts          optional daily refresh (Vercel Cron + Blob)
```

- The dashboard and API are read-only on Vercel.
- `node:sqlite` opens the snapshot read-only from `/tmp`.
- `POST /api/v1/ingest` is not exposed on Vercel (the route is intentionally omitted); use the cron or run locally.
- With Vercel Blob configured, the daily cron downloads the latest DB, runs a full ingest, checkpoints it, and uploads it back.
- Without Blob, Vercel serves the committed snapshot and stays read-only.

## 1. Create the snapshot

```bash
npm install
npm run ingest       # ~60s; Seal full scan is the slow part
npm run snapshot     # writes data/secnev.snapshot.db (journal_mode=DELETE)
```

Commit `data/secnev.snapshot.db`. The `.gitignore` keeps the live `data/secnev.db` out of Git but allows the snapshot.

## 2. Import the project into Vercel

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Import it in Vercel.
3. Framework preset: **Other**.
4. Build command: `npm run build`.
5. Output directory: `public`.
6. Node.js version: **24 or newer** (`node:sqlite` is required).

The first deployment works immediately with the committed snapshot.

## 3. Optional: enable the daily refresh

1. In Vercel, create a **Blob** store and connect it to the project.
2. Add these environment variables to Production:
   - `BLOB_READ_WRITE_TOKEN` — from the Blob store connection.
   - `CRON_SECRET` — any long random string. Vercel sends it as `Authorization: Bearer <CRON_SECRET>` to cron routes.
3. Redeploy.
4. The cron in `vercel.json` runs **once per day at 03:00 UTC** (Hobby allows daily only).

The cron route is:

```text
GET /api/cron/ingest
Authorization: Bearer $CRON_SECRET
```

It returns the ingest stats and the uploaded Blob URL.

### Blob behavior

- The API function downloads the latest `secnev.db` from Blob on cold start and opens it read-only from `/tmp`.
- If Blob is unavailable or empty, it falls back to the committed `data/secnev.snapshot.db`.
- The cron writes the DB with `journal_mode=DELETE` before upload, so read-only opens are safe.
- The Blob is **public** because secnev's data is public. It contains no secrets.

## Hobby limits and fit

| Limit | Hobby | secnev |
|---|---|---|
| Cron frequency | Once per day | Daily at 03:00 UTC |
| Function max duration | 300s | Full ingest ~60s; Seal ~43s |
| Function memory/CPU | 2 GB / 1 vCPU | Well within |
| Serverless functions per deployment | 12 | 12 (11 API routes + cron) |
| Function invocations | 1M/month | API + one cron/day |
| Deployments/day | 100 | Fine |
| Static uploads | 100 MB | Public assets are tiny; snapshot ~1.2 MB |

Vercel Hobby cron timing is approximate (within the scheduled hour), and Hobby is for non-commercial/personal use. For a production public-good deployment with frequent updates, move to Pro or run the ingest in GitHub Actions and deploy the snapshot.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | No | Persist the daily cron ingest to Vercel Blob |
| `CRON_SECRET` | For cron | Authenticate Vercel Cron requests |
| `ADMIN_TOKEN` | No | Local/manual `POST /api/v1/ingest`; the route is not deployed on Vercel |
| `CKB_RPC_URL` | No | Override the public CKB RPC |
| `CKB_EXPLORER_URL` | No | Override the Explorer API |
| `MAX_CELL_PAGES` | No | `0` = full scan (default) |
| `CELL_SCAN_BUDGET_MS` | No | Full-scan time budget, default `180000` |

## Local vs Vercel

| Feature | Local `npm run dev` | Vercel Hobby |
|---|---|---|
| Dashboard/API | Live | Live (read-only snapshot) |
| Full ingest | Yes | Daily cron with Blob |
| `POST /api/v1/ingest` | Yes (admin token) | Not exposed (use cron/local) |
| SQLite | `data/secnev.db` (WAL) | `/tmp/secnev.db` (read-only) |
| Alerts | Stored + delivered | Stored in snapshot; cron alerts delivered |

## Troubleshooting

- **`No database available`** — run `npm run snapshot` and commit `data/secnev.snapshot.db`; ensure `includeFiles` in `vercel.json` includes it.
- **`node:sqlite` not found** — set the project Node.js version to 24 or 26.
- **Cron 401** — set `CRON_SECRET` and redeploy; Vercel sends the header automatically.
- **Cron 503 `blob_not_configured`** — connect a Blob store and set `BLOB_READ_WRITE_TOKEN`.
- **Stale data** — Hobby cron is daily and approximate. Run `npm run ingest && npm run snapshot`, commit, and redeploy for an immediate refresh.
- **Function timeout** — the full ingest is ~60s. If CKB RPC is slow, raise `CELL_SCAN_BUDGET_MS` carefully; the Hobby limit is 300s.

## Security notes

- `CRON_SECRET` is the only write credential on Vercel.
- `POST /api/v1/ingest` is disabled in read-only mode.
- The SQLite snapshot and Blob contain public on-chain data and public scores.
- Do not put `ALERT_EMAIL_PASS`, Telegram tokens or webhook secrets in client-side code; they are server-only env vars.
