export const DAY = 86400000;
export const SECTORS = {
  'AI & data': { color: '#7360cf', short: 'AI & data', match: ['ai', 'ai infrastructure', 'data and analytics', 'developer tools'] },
  'Health & biotech': { color: '#4c92a0', short: 'Health', match: ['healthtech', 'biotech', 'medtech'] },
  'Fintech': { color: '#5e84d5', short: 'Fintech', match: ['fintech', 'crypto', 'payments', 'insurtech'] },
  'Cybersecurity': { color: '#3f667b', short: 'Security', match: ['cybersecurity'] },
  'Climate & energy': { color: '#579576', short: 'Climate', match: ['climate', 'energy', 'agtech and food'] },
  'Robotics & mobility': { color: '#cc925a', short: 'Robotics', match: ['robotics', 'mobility', 'logistics'] },
  'Space & defense': { color: '#8d78a3', short: 'Space', match: ['space', 'defense'] },
  'Hardware': { color: '#729389', short: 'Hardware', match: ['hardware', 'semiconductors', 'quantum', 'manufacturing'] },
  'Enterprise software': { color: '#6a9fb5', short: 'Software', match: ['enterprise software', 'legal tech', 'hr tech', 'proptech'] },
  'Consumer': { color: '#b78b93', short: 'Consumer', match: ['consumer', 'marketplace', 'edtech', 'ecommerce', 'media and gaming'] },
  'Other / unclassified': { color: '#929aab', short: 'Other', match: [] },
};
export function safeURL(value) { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
export function validDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s; }
export function shiftDate(s, n) { return new Date(Date.parse(s + 'T00:00:00Z') + n * DAY).toISOString().slice(0,10); }
export function periodRange(end, period = 'week') {
  const days = {day:1,week:7,month:30}[period] || 7;
  return { start:shiftDate(end,1-days), end, previousStart:shiftDate(end,1-2*days), previousEnd:shiftDate(end,-days), days };
}
export function canonicalName(name='') {
  const n = name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const aliases = {'a16z':'andreessen horowitz','andreessen horowitz':'andreessen horowitz','google ventures':'gv','lightspeed':'lightspeed venture partners','insight venture partners':'insight partners','the venture city':'theventurecity','b capital group':'b capital'};
  return aliases[n] || n;
}
export function canonicalDomain(value='') { try { return new URL(value.includes('://')?value:`https://${value}`).hostname.toLowerCase().replace(/^www\./,''); } catch{return '';} }
export function sectorFor(value) { return Object.keys(SECTORS).find(k=>SECTORS[k].match.includes((value||'').toLowerCase())) || 'Other / unclassified'; }
export function stageLabel(stage, written, extension) {
  const names={pre_seed:'Pre-seed',seed:'Seed',pre_a:'Pre-Series A',series_a:'Series A',series_b:'Series B',series_c:'Series C',series_d_plus:'Series D+',growth:'Growth',bridge:'Bridge',other:'Unspecified',undisclosed:'Undisclosed',debt:'Debt',grant:'Grant',secondary:'Secondary',convertible:'Convertible'};
  return (written && /^series\s+[a-z](?:\s|$)/i.test(written) ? written.replace(/financing|funding|round/gi,'').trim().slice(0,45) : names[stage] || 'Unspecified') + (extension && !/exten/i.test(written||'') ? ' extension':'');
}
function normalizeSources(sources=[]) {
  const seen = new Set();
  return sources.flatMap(s=>{const url=safeURL(s.url);if(!url)return [];const u=new URL(url);u.hash='';for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_')||['frmsrc','bookmarid','ref'].includes(k))u.searchParams.delete(k);const key=u.href.replace(/\/$/,'');if(seen.has(key))return [];seen.add(key);return [{url:u.href,publisher:u.hostname.replace(/^www\./,''),published:validDate(s.published?.slice(0,10))?s.published.slice(0,10):null}];});
}
export function normalizeRound(raw, fetchedAt) {
  if(!raw?.company?.name || !raw.id) throw new Error('Funding record is missing its company or ID.');
  const amount = raw.amount || {};
  const reasons=[];
  if(raw.disposition && raw.disposition!=='publish')reasons.push('Not published by provider');
  if(raw.history)reasons.push('Historical backfill');
  if(raw.hold)reasons.push('Provider hold requires review');
  const notes=(raw.verification?.notes||[]).join(' ');
  if(/held for review|under discussion|nearing .*rather than completed|not an equity funding|project financing|debt facility|credit facility.*included|combined Series/i.test(notes+' '+(raw.stage_as_written||'')))reasons.push('Financing scope or completion needs review');
  for(const match of notes.matchAll(/date .*?read as (\d{4}-\d{2}-\d{2})/g))if(match[1]!==raw.announced_on)reasons.push('Provider date correction conflicts with record');
  if(raw.certainty!=='announced')reasons.push('Not an announced round');
  if(!validDate(raw.announced_on)||raw.date_precision!=='day')reasons.push('Announcement date is incomplete');
  if(raw.announced_on > fetchedAt.slice(0,10))reasons.push('Future announcement date');
  if(['debt','grant','convertible','secondary'].includes(raw.stage))reasons.push('Debt, grant, convertible or secondary financing');
  if(['financing_total','cumulative','includes_grants','includes_secondary'].includes(raw.amount_scope))reasons.push('Combined or cumulative financing');
  const sources=normalizeSources(raw.sources);
  if(!sources.length)reasons.push('No original source link');
  const investors = [...(raw.lead_investors||[]).map(name=>({name,role:'Lead (provider)'})),...(raw.other_investors||[]).map(name=>({name,role:'Participant'}))].filter(x=>typeof x.name==='string' && x.name.trim() && !/^(others?|undisclosed|unnamed|existing investors?|new investors?)$/i.test(x.name.trim()));
  const investorMap=new Map();for(const inv of investors){const id=canonicalName(inv.name);if(id&&!investorMap.has(id))investorMap.set(id,{...inv,id});}
  const rawUSD = typeof amount.usd_millions === 'number' && Number.isFinite(amount.usd_millions) && amount.usd_millions>0 ? amount.usd_millions*1e6 : null;
  const approximate=/\b(over|more than|at least|up to|approximately|nearly|about)\b|\d\s*\+/i.test(amount.as_written||'');
  const dollarAmount=amount.currency==='USD'&&!approximate?rawUSD:null;
  return {id:String(raw.id), providerIds:[String(raw.id)], company:raw.company.name, companyKey:canonicalDomain(raw.company.domain||raw.company.website)||canonicalName(raw.company.name), website:safeURL(raw.company.website), location:raw.company.hq||'Location not stated', description:(raw.company.description||'').slice(0,300), sector:sectorFor(raw.company.sector), originalSector:raw.company.sector||'Unclassified', stage:stageLabel(raw.stage,raw.stage_as_written,raw.is_extension), stageKey:raw.stage||'other', extension:!!raw.is_extension, date:raw.announced_on||null, currency:amount.currency||null, amountText:amount.as_written||'Not disclosed', amountUSD:dollarAmount, providerUSD:rawUSD, amountScope:raw.amount_scope||'not specified', amountNote:!rawUSD?'Amount not disclosed':amount.currency!=='USD'?'Non-USD amount excluded from dollar metrics; no FX rate assumed':approximate?'Bounded or approximate amount excluded from dollar metrics':raw.amount_scope==='tranche'?'Incremental tranche, not the full historic round':raw.amount_scope?null:'Amount scope not specified by provider', certainty:raw.certainty||'unconfirmed', sources, investors:[...investorMap.values()], verification:raw.verification?.status||'unreviewed', verificationNotes:raw.verification?.notes||[], providerCheckedAt:raw.verification_checks?.last_checked_at||null, collectedAt:fetchedAt, excluded:reasons, reviewed:false, reviewNote:null};
}
export function deduplicate(rounds) {
  const out=[];let mergedRecords=0;
  for(const original of rounds){
    const r=structuredClone(original);
    const match=out.find(o=>o.providerIds.some(id=>r.providerIds.includes(id)) || (o.companyKey===r.companyKey && o.date===r.date && o.stageKey===r.stageKey && o.stage===r.stage && o.extension===r.extension && o.currency===r.currency && o.amountUSD===r.amountUSD && (o.amountUSD!==null || o.amountText===r.amountText)));
    if(!match){out.push(r);continue;}
    mergedRecords++;
    match.excluded=[...new Set([...match.excluded,...r.excluded])];
    match.providerIds=[...new Set([...match.providerIds,...r.providerIds])];
    match.sources=normalizeSources([...match.sources,...r.sources]);
    const m=new Map([...match.investors,...r.investors].map(i=>[i.id,i]));match.investors=[...m.values()];
    if(match.amountUSD!==r.amountUSD||match.date!==r.date||match.companyKey!==r.companyKey){match.amountUSD=null;match.excluded=[...new Set([...match.excluded,'Conflicting records require review'])];}
  }
  // Similar, non-identical records are held for review rather than counted twice.
  for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){
    const a=out[i],b=out[j];
    if(a.companyKey===b.companyKey && a.stageKey===b.stageKey && a.extension===b.extension && a.currency===b.currency && a.amountUSD && a.amountUSD===b.amountUSD && validDate(a.date)&&validDate(b.date) && Math.abs(Date.parse(a.date)-Date.parse(b.date))<=3*DAY){
      a.excluded=[...new Set([...a.excluded,'Possible duplicate: date or stage differs'])];b.excluded=[...new Set([...b.excluded,'Possible duplicate: date or stage differs'])];
    }
  }
  return {rounds:out,mergedRecords};
}
export function filterRounds(rounds, filters={}) {
  const q=(filters.query||'').toLowerCase().trim();
  return rounds.filter(r=>!r.excluded.length && (!filters.start||r.date>=filters.start) && (!filters.end||r.date<=filters.end) && (!filters.sector||r.sector===filters.sector) && (!filters.stage||r.stageKey===filters.stage) && (!filters.excludeMega||!(r.providerUSD>=1e8)) && (!filters.reviewedOnly||r.reviewed) && (!q||`${r.company} ${r.sector} ${r.location} ${r.investors.map(i=>i.name).join(' ')}`.toLowerCase().includes(q)));
}
export function stats(rounds) {
  const amounts=rounds.map(r=>r.amountUSD).filter(n=>n!==null&&Number.isFinite(n)).sort((a,b)=>a-b);
  const n=amounts.length,total=amounts.reduce((a,b)=>a+b,0),mid=Math.floor(n/2);
  return {total,rounds:rounds.length,investors:new Set(rounds.flatMap(r=>r.investors.map(i=>i.id))).size,average:n?total/n:null,median:n?(n%2?amounts[mid]:(amounts[mid-1]+amounts[mid])/2):null,disclosed:n,missing:rounds.length-n,sources:new Set(rounds.flatMap(r=>r.sources.map(s=>s.publisher))).size};
}
export function change(current,previous) {
  if(current===null||previous===null)return {value:null,label:'No comparable amounts',direction:'neutral'};
  if(previous===0)return {value:null,label:current===0?'No captured activity':'No prior baseline',direction:'neutral'};
  const value=(current-previous)/previous*100;
  return {value,label:`${value>0?'+':''}${value.toFixed(1)}%`,direction:value>0?'up':value<0?'down':'neutral'};
}
export function industryStats(current,previous) {return Object.keys(SECTORS).map(sector=>{const rows=current.filter(r=>r.sector===sector);const s=stats(rows);const prev=stats(previous.filter(r=>r.sector===sector));return {sector,...s,change:change(s.disclosed||!s.rounds?s.total:null,prev.disclosed||!prev.rounds?prev.total:null),previous:prev.disclosed||!prev.rounds?prev.total:null};}).filter(s=>s.rounds||s.previous).sort((a,b)=>b.total-a.total||b.rounds-a.rounds);}
export function investorStats(rounds){const map=new Map();for(const r of rounds)for(const i of r.investors){if(!map.has(i.id))map.set(i.id,{...i,rounds:[],leads:0});const v=map.get(i.id);v.rounds.push(r);if(i.role.startsWith('Lead'))v.leads++;}return [...map.values()].map(i=>({...i,sectors:[...new Set(i.rounds.map(r=>r.sector))],volume:stats(i.rounds).disclosed?stats(i.rounds).total:null})).sort((a,b)=>b.rounds.length-a.rounds.length||b.volume-a.volume);}
export function dailySeries(rounds,start,end){const series=[];for(let date=start;date<=end;date=shiftDate(date,1)){const rows=rounds.filter(r=>r.date===date);series.push({date,...stats(rows)});}return series;}
export function csvCell(value){let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function toCSV(rounds){const headings=['Company','Announcement date','Industry (grouped)','Stage','Original amount','Currency','USD amount included','Amount note','Named investors','Original source URLs','Provider','Collected at','Review status'];return [headings,...rounds.map(r=>[r.company,r.date,r.sector,r.stage,r.amountText,r.currency,r.amountUSD,r.amountNote,r.investors.map(i=>i.name).join('; '),r.sources.map(s=>s.url).join('; '),'Fireround',r.collectedAt,r.reviewed?'Primary source checked':'Provider record'])].map(row=>row.map(csvCell).join(',')).join('\r\n');}
