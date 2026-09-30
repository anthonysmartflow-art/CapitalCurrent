import { readFile, writeFile } from 'node:fs/promises';
import { normalizeRound, deduplicate } from '../src/market.js';
import { applyReviews } from '../server/reviews.mjs';
const source=JSON.parse(await readFile(process.argv[2],'utf8'));
const {rounds,mergedRecords}=deduplicate(applyReviews(source.raw.map(r=>normalizeRound(r,source.fetchedAt))));
const snapshot={meta:{provider:'Fireround',mode:'snapshot',fetchedAt:source.fetchedAt,requestedSince:'2026-08-01',requestedUntil:source.fetchedAt.slice(0,10),providerContinuousSince:'2026-09-06',paginationComplete:source.paginationComplete,pages:source.pageCount,rawRecords:source.raw.length,mergedRecords,independentFeeds:1,termsCheckedOn:'2026-09-30'},rounds};
await writeFile(new URL('../public/data/snapshot.json',import.meta.url),JSON.stringify(snapshot));
console.log(JSON.stringify({records:rounds.length,included:rounds.filter(r=>!r.excluded.length).length,reviewed:rounds.filter(r=>r.reviewed).length,mergedRecords}));
