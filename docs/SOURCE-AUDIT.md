# Source audit — September 30, 2026

## Fireround: connected

- Public overview responded: https://fireround.dev/overview
- Terms retrieved directly: https://fireround.dev/terms (page states updated September 29, 2026).
- Terms explicitly permit using, copying and republishing records. Attribution is appreciated and is provided in this app.
- API documentation retrieved: https://fireround.dev/api/v1/openapi.json
- Tested endpoint: `GET /api/v1/rounds?since=2026-08-01&limit=200`; three cursor-paginated requests retrieved 530 source records for the initial snapshot.
- JSON/JSONL API limit stated in the terms: 60 requests/minute. This app uses at most eight sequential pages per refresh and a one-minute local cooldown; HTTP 429 is surfaced and existing data retained. A page cap is disclosed as incomplete pagination.
- Home page advertises MIT code and links to https://github.com/firecrawl/fireround . That repository's README returned 404 during the check. The software license was not used as a substitute for data-use permission.
- Data can contain errors. For example, the supplied EliseAI series label disagreed with the company announcement, Jeeves' company release did not name a series, and Reverion's page date differed from its press-release dateline. Narrow source checks are documented per record.

## Dealroom: reference only

- Located current public dashboard: https://dealroom.co/vc-investment-dashboard/
- The older `/guides/global-venture-capital-monitor` URL displayed “Guide not found.”
- API product page: https://dealroom.co/products/dealroom-api/ advertises public utility endpoints as samples, alongside paid/full API channels.
- Terms: https://dealroom.co/terms-of-service restrict scraping and publishing raw datasets or making API contents available to third parties.
- Decision: link to dashboard and API details; no dataset import. A suitable agreement must govern any future product connector.

## FinSMEs: reference links only

- Homepage https://www.finsmes.com/ returned HTTP 403 to the research tool. It was not bypassed.
- Terms location found: https://www.finsmes.com/wp-content/plugins/complianz-terms-conditions/download.php ; no feed license was established.
- Decision: no direct scraper or feed. Links can appear when included in a permitted Fireround record.

## VC News Daily: reference links only

- Public homepage readable: https://www.vcnewsdaily.com/
- Terms reviewed: https://vcnewsdaily.com/terms.php restrict material copying, storage and redistribution, while allowing normal browsing and linking.
- Decision: no direct feed import or scrape. Link only. Public company releases can independently support selected research checks.

## Crunchbase: reference only

- Public reporting available: https://news.crunchbase.com/
- Terms: https://about.crunchbase.com/terms-of-service/
- API terms: https://data.crunchbase.com/docs/terms
- Decision: no Crunchbase database extraction or article-feed reproduction. Public reports are linked for context; an appropriate commercial API agreement would be needed for product use.

## PitchBook–NVCA: aggregate context only

- Public quarterly hub: https://nvca.org/pitchbook-nvca-venture-monitor/
- Hub displayed Q2 2026 as the current report during research.
- Decision: link to the report separately. Do not combine quarterly US aggregate totals with this global announcement sample or imply a live round-level API.

## Selected primary-announcement checks

These are small factual checks, not broad audits or independent confirmations of completed capital transfers.

- EliseAI: https://www.globenewswire.com/news-release/2026/09/29/3370681/0/en/eliseai-raises-350-million-at-4-billion-valuation-to-bring-ai-deeper-into-housing-and-healthcare-operations.html — $350M, September 29; release does not name a series. Lead and participating names taken from the release.
- Jeeves: https://www.prnewswire.com/news-releases/jeeves-raises-110-million-equity-round-to-scale-its-stablecoin-native-banking-platform-for-global-enterprises-across-35-countries-302892811.html — $110M equity, September 29; series unspecified in the company release.
- Tiny Health: https://insider.fitt.co/press-release/tiny-health-raises-33m-series-b-to-establish-microbiome-intelligence-as-the-standard-of-care/ — company-issued release, $33M Series B, September 29; $46M is lifetime funding. Grouped under Health & biotech based on its business.
- Breye: https://www.globenewswire.com/news-release/2026/09/29/3370426/0/en/breye-therapeutics-raises-67-5-million-in-over-subscribed-series-a-financing.html — €67.5M Series A, September 29; excluded from USD aggregates.
- Enveda: https://enveda.com/news/enveda-raises-311-million/ — $311M Series E, September 23; lifetime raised is separate. If the provider has held this record, the check does not automatically override its exclusion.
- Reverion: https://reverion.com/en/reverion-raises-175m-series-b-to-scale-production-of-its-dispatchable-carbon-negative-power-plants-tenfold/ — $175M Series B. Page publication says September 28 while dateline says September 29; retained for inspection and held out when date fields conflict.

## Definition of duplicate

Repeated provider IDs are merged. Exact company identity, date, stage, extension, currency and amount matches also merge, preserving all distinct source URLs and investor names. Similar non-identical records with the same company/stage/amount within three days are excluded for review. Different companies and separately announced extensions are kept distinct. This conservative matching is not a comprehensive entity-resolution system.
