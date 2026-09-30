import { normalizeRound, deduplicate, shiftDate } from '../src/market.js';
import { applyReviews } from './reviews.mjs';
export const providers = [
 {id:'fireround',name:'Fireround',status:'connected',mode:'On-demand public API',url:'https://fireround.dev/overview',terms:'https://fireround.dev/terms',docs:'https://fireround.dev/api/v1/openapi.json',note:'Terms checked September 30, 2026 permit using, copying and republishing records. One automated aggregator; underlying links are not separate live integrations.'},
 {id:'dealroom',name:'Dealroom',status:'reference',mode:'Public dashboard · license needed for a connector',url:'https://dealroom.co/vc-investment-dashboard/',terms:'https://dealroom.co/terms-of-service',docs:'https://dealroom.co/products/dealroom-api/',note:'Public dashboard available. Free utility endpoints are advertised, but bulk data sharing is restricted by the general terms. No data imported.'},
 {id:'finsmes',name:'FinSMEs',status:'reference',mode:'Publisher links only',url:'https://www.finsmes.com/',terms:'https://www.finsmes.com/wp-content/plugins/complianz-terms-conditions/download.php',note:'Direct reading returned HTTP 403 during this check. Not bypassed. Referenced only where the permitted Fireround records provide links.'},
 {id:'vcnews',name:'VC News Daily',status:'reference',mode:'Publisher links only',url:'https://www.vcnewsdaily.com/',terms:'https://vcnewsdaily.com/terms.php',note:'Public announcements are readable. Terms restrict reproduction and storage. No direct scraper or imported feed.'},
 {id:'crunchbase',name:'Crunchbase News',status:'reference',mode:'Public reporting · licensed API separate',url:'https://news.crunchbase.com/',terms:'https://about.crunchbase.com/terms-of-service/',docs:'https://data.crunchbase.com/docs/terms',note:'Public reporting provides market context. Database/API access and redistribution require appropriate terms. No Crunchbase dataset imported.'},
 {id:'nvca',name:'PitchBook–NVCA',status:'reference',mode:'Quarterly market context',url:'https://nvca.org/pitchbook-nvca-venture-monitor/',note:'Q2 2026 public report located. Quarterly US aggregate context is kept separate from announcement-level totals. No report dataset imported.'},
];
// Server-side adapter contract: { id, fetch({since, now, fetcher}) -> normalized snapshot }.
// New connectors must implement this contract under a suitable data-use agreement.
export const fireroundAdapter = {
 id:'fireround',
 async fetch({since,now=new Date(),fetcher=fetch,maxPages=8}={}) {
  const fetchedAt=now.toISOString();const after=since||shiftDate(fetchedAt.slice(0,10),-60);
  let cursor=null,raw=[],pages=0;const visited=new Set();
  do {
   const u=new URL('https://fireround.dev/api/v1/rounds');u.searchParams.set('since',after);u.searchParams.set('limit','200');if(cursor)u.searchParams.set('cursor',cursor);
   const res=await fetcher(u,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});
   if(!res.ok)throw new Error(res.status===429?'Provider rate limit reached. Try again later.':`Provider returned HTTP ${res.status}.`);
   const body=await res.json();if(!Array.isArray(body.data))throw new Error('Provider returned an unrecognized data format.');
   raw.push(...body.data);pages++;cursor=body.next_cursor||null;
   if(cursor&&visited.has(cursor))throw new Error('Provider returned a repeated pagination cursor.');if(cursor)visited.add(cursor);
  }while(cursor&&pages<maxPages);
  if(!raw.length)throw new Error('Provider returned no records. The existing snapshot has been preserved.');
  const normalized=raw.map(r=>normalizeRound(r,fetchedAt));applyReviews(normalized);
  const {rounds,mergedRecords}=deduplicate(normalized);
  return {meta:{provider:'Fireround',fetchedAt,mode:'live-fetch',requestedSince:after,requestedUntil:fetchedAt.slice(0,10),providerContinuousSince:'2026-09-06',paginationComplete:!cursor,pages,rawRecords:raw.length,mergedRecords,independentFeeds:1,termsCheckedOn:'2026-09-30'},rounds};
 }
};
export function adapterFor(id){if(id==='fireround')return fireroundAdapter;throw new Error('This source is reference-only. A licensed adapter is not configured.');}
