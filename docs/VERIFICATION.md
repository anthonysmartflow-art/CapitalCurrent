# Verification — September 30, 2026

## Completed

- Vercel preparation: 3 additional hosted API tests passed (19 total tests), covering real saved data loading, allowed methods, same-domain refresh, rejected external origins, concurrent fetch sharing, instance cooldown and snapshot retention on failure. Syntax checks and both static and Vercel frontend builds passed. Vercel deployment itself has not been performed or verified.
- Syntax checks for the interface, data engine and local server: passed.
- 16 focused data tests: passed. Covers period boundaries, leap days, unknown values, mean/median, currency exclusions, investor aliases, exact duplicates, wording variants, conflicting duplicates, distinct extensions, URL normalization, filters, CSV escaping, pagination, rate limits, malformed/empty feed responses, and real snapshot provenance.
- 15 browser checks: passed, including all main navigation, period switching, industry and stage filtering, mega-round exclusion, company search, empty states, company and investor drilldowns, original-source links in dialogs, Escape/focus restoration, chart controls, CSV download, real live refresh, and retention of the preceding snapshot after a simulated refresh failure.
- Layout checked at 1440, 1024, 768, 390 and 320 CSS pixels. No page-level horizontal overflow in the overview at any tested width. Wide comparison tables have their own scroll containers. Source view and dialogs also checked at 320px.
- Reduced-motion mode checked. A 720px desktop layout was also checked as the viewport equivalent of 200% zoom on a 1440px display; browser zoom itself was not independently measured.
- Final automated axe scans: zero reported violations on desktop overview, funding rounds, investors, source coverage, and mobile overview. Some contrast checks on complex elements remain marked for manual review by axe; this is not accessibility certification.
- Uncaught browser errors during the full interaction run: zero.
- A CSV download was opened and parsed: 69 filtered announcements, 13 consistent columns, source URLs and collection timestamps retained. This row count describes that test's snapshot, not an invariant live total.
- Static `dist/` preview served separately and checked: bundled snapshot loaded, live refresh visibly disabled, expected content rendered, no browser errors reported.

## Live refresh evidence

The first end-to-end browser refresh completed at **2026-09-30 16:07:02 UTC**, retrieving 532 Fireround records in three pages. 303 passed the local eligibility checks at that time. The snapshot already displayed remained intact when a later refresh failure was simulated. A final refresh was also checked after the last deduplication changes.

Live counts can change when the upstream API updates. The bundled starting snapshot remains the 530-record fetch from earlier the same day. Both modes display their actual collection timestamp.

## Evidence files

These raw captures remain in the local working folder and are excluded from the GitHub repository. This report and the test runners are included.

- `artifacts/ui-results.json`: full browser check results.
- `artifacts/live-refresh.json`: metadata from the end-to-end live refresh.
- `artifacts/a11y-*-final.json`: final automated accessibility results.
- `artifacts/preview-desktop.png`, `artifacts/preview-mobile.png`: rendered previews.
- `artifacts/overview-1440.png`, `overview-1024.png`, `overview-768.png`, `overview-390.png`, `overview-320.png`: full-page responsive captures.
- `artifacts/company-detail.png`, `mobile-detail-320.png`, `source-coverage.png`, `sources-320.png`: detail and coverage views.
- `artifacts/export.csv`: actual downloaded sample export.

## Remaining product limits

No production deployment, authentication, persistent live cache, scheduled ingestion, complete market coverage, exhaustive entity resolution, or independent verification of every source record. The other five investigated providers remain reference-only. Individual investor contributions and returns are unavailable. Live access depends on Fireround remaining available under its published terms. A server restart restores the bundled snapshot until the next requested refresh.
