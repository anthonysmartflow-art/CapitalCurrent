# Capital Current

A working venture-capital funding dashboard with a real, attributable Fireround API snapshot and an on-demand live connector. Runs locally or on Vercel. No invented companies, rounds, investor participations, or headline figures.

## Import into Vercel

Import **anthonysmartflow-art/CapitalCurrent** from GitHub. The app is at the repository root, so leave **Root Directory** at its default (`./`). Select **Other** if Vercel asks for a framework. The included `vercel.json` sets:

- Build command: `npm run build:vercel`
- Output directory: `dist`
- Node serverless endpoints: `/api/rounds`, `/api/providers`, `/api/refresh`
- Fluid compute enabled for the paginated refresh request

No environment variables, paid data subscription or API keys are required for this prototype. After deployment, open the dashboard and click **Refresh feed** to verify Fireround access from the hosted function. The hosting configuration and handlers are tested locally; deployment is a separate step.

The frontend is static; Vercel functions perform live refreshes. The starting data is the dated bundled snapshot. Refreshed data lives in the current browser view and disposable function memory, not a database. A reload can return the bundled snapshot on another instance. The displayed collection timestamp always identifies the actual data. The one-minute refresh cooldown is per function instance, not a global traffic limit. Persistent ingestion and distributed rate limiting would be later production work.

See [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json) and [Node.js functions](https://vercel.com/docs/functions/runtimes/node-js).

## Run

Requires Node.js 22 or newer. No dependency installation or API key is needed.

```sh
git clone https://github.com/anthonysmartflow-art/CapitalCurrent.git
cd CapitalCurrent
npm start
```

If your terminal is already in this folder, just run `npm start`. Open **http://127.0.0.1:4173**. Keep the terminal running while using the preview. Set `PORT=4174 npm start` if port 4173 is occupied.

## Explore

- **Market overview:** day / week / month (trailing 1 / 7 / 30 days), period ending date, industry and funding-stage filters, company/investor search, and a $100M+ exclusion toggle.
- **Industry pulse:** disclosed USD volume, prior-period change, announcement count, unique named investors, average and median round size. Select an industry to see its rounds.
- **Funding rounds:** sortable, paginated announcements. Select a company for investors, original sources, collection and review timestamps, and qualification notes.
- **Investors:** participating rounds and associated round volume, explicitly distinguished from individual investment amounts. Select a firm and then any portfolio company.
- **Source coverage:** connection status for all six investigated sources, publication references, completeness, exclusion reasons, and calculation notes.
- **Export CSV:** exports the current filtered announcements with original amounts, investor names, source URLs and timestamps.

## What is live and what is prototype

| Component | Actual behavior |
| --- | --- |
| Fireround connector | `Refresh feed` fetches the public documented API on demand, follows cursor pagination, normalizes records, applies checks, and updates the preview. No background polling. |
| Starting data | A genuine API snapshot retrieved September 30, 2026, with its exact collection timestamp embedded. 530 source records before local eligibility checks. |
| Offline / failed refresh | The previous snapshot stays visible. An error identifies a failed refresh; stale data is never silently relabeled live. |
| Other five providers | Public references and modular future adapter slots, not active integrations. No restricted feeds are scraped or redistributed. |
| UI and analytics | Functional filters, calculations, charts, dialogs, tables, pagination and exports; all derived from the same normalized records. |
| Storage and hosting | Bundled snapshot plus in-memory refresh cache. Vercel import configuration included; no account system, persistent database or scheduler. Hosting requires a separate deployment. |

## Data boundaries

Fireround's [terms](https://fireround.dev/terms), checked September 30, 2026, explicitly permit using, copying and republishing its records. The site advertises MIT source code, but the linked GitHub repository/README could not be retrieved during this build. The working API is documented in its [OpenAPI specification](https://fireround.dev/api/v1/openapi.json).

The app consumes structured records from this permitted API, not the original publishers' article feeds. It retains source links and provider qualifications, but deliberately omits article quotations, external photos/logos, personal-contact enrichment, and full article text. Original publishers retain their rights. A referenced publisher is not an independent connected feed.

Only announced records that pass the adapter's checks enter the main metrics. Provider holds/flags, historical backfills, expected financings, unclear dates, certain combined financings, debt, grants, convertible financings, and secondary financings are held outside the main figures. Inspect them from Source coverage. Automated checks cannot guarantee that every remaining record is a private-company VC equity round.

USD statistics include only positive disclosed amounts stated in USD without approximate or bounded wording. Other currency amounts and unknown sizes remain visible in announcement counts, but do not enter USD totals, averages or medians. No undocumented currency conversion is used. Amount scope is shown when the provider leaves it unspecified.

The count measures announced funding events, not executed securities transactions or investor checks. Counts of unique investors are limited to named participants and known aliases. Per-investor check sizes are not inferred. Lead roles are provider-reported unless a primary-source review is noted.

Comparisons use equal, non-overlapping periods with identical filters. Fireround reports continuous collection from September 6, 2026; earlier comparison periods are sparse. Current days are partial. None of these figures should be interpreted as total market volume, reliable market growth, returns, or industry profitability.

Six selected announcements have key facts checked against company-issued announcements. Review notes explain corrections or ambiguity; this is not independent verification of the entire feed. The research snapshot retains excluded reviewed items for transparency.

## Build and verification

```sh
npm run check
npm test
npm run build
```

`npm test` runs focused data and hosted API tests with Node's built-in test runner. `npm run build` writes a dependency-free static preview to `dist/`. Serve `dist/` from any static web server; it uses the bundled snapshot and labels live refresh unavailable. `npm run build:vercel` builds the frontend with the hosted live API enabled. To use the live connector locally, run the Node preview with `npm start`.

The verification report is in `docs/VERIFICATION.md`. Raw browser captures remain in the local `artifacts/` folder and are excluded from Git. The optional `tests/ui.mjs` test runner needs Playwright and a browser CDP endpoint if you wish to rerun the browser checks. They are not required to run the app.

## Structure

- `src/app.js`, `src/styles.css`: original interface, charts, interactions and accessibility.
- `src/market.js`: normalization, currency policy, deduplication, eligibility, period and investor calculations, CSV export.
- `server/adapters.mjs`: Fireround connector and the reference-source registry. Other adapters are disabled explicitly.
- `server/reviews.mjs`: narrow, date-and-amount-bound primary-source checks.
- `server/index.mjs`: local-only HTTP server, refresh handling and snapshot retention.
- `api/*.js`, `server/hosted-api.mjs`: hosted function entrypoints, origin checks, refresh handling and disposable cache.
- `vercel.json`: Vercel build, output and function settings.
- `public/data/snapshot.json`: normalized attributable snapshot, excluding copied article text.
- `docs/SOURCE-AUDIT.md`: source checks and implementation choices.

Future adapters must return the same normalized snapshot contract, include provenance and completeness metadata, and operate under applicable provider permissions. Keep credentials on the server. The public prototype intentionally has no credentials or restricted-feed integrations.
