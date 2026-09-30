import test from 'node:test';
import assert from 'node:assert/strict';
import { createHostedApi } from '../server/hosted-api.mjs';
import rounds from '../api/rounds.js';
import providers from '../api/providers.js';
import refresh from '../api/refresh.js';

function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(value) { this.body = JSON.parse(value); } };
}
const request = (method = 'POST', origin = 'https://capital.example') => ({ method, headers: { host: 'capital.example', origin } });
const snapshot = { meta: { mode: 'snapshot', fetchedAt: '2026-09-30T00:00:00Z' }, rounds: [] };

test('hosted entrypoints serve the attributable snapshot and reference registry, and enforce methods', async () => {
  const data = response(), sources = response(), bad = response();
  await rounds(request('GET'), data);
  await providers(request('GET'), sources);
  await refresh(request('GET'), bad);
  assert.equal(data.statusCode, 200);
  assert.ok(data.body.rounds.length > 100);
  assert.ok(data.body.meta.fetchedAt);
  assert.equal(sources.body.length, 6);
  assert.equal(bad.statusCode, 405);
  assert.equal(bad.headers.Allow, 'POST');
});

test('hosted refresh accepts its own domain, updates data and enforces the instance cooldown', async () => {
  let now = 0, calls = 0;
  const live = { ...snapshot, meta: { mode: 'live-fetch', fetchedAt: '2026-09-30T01:00:00Z' } };
  const api = createHostedApi({ snapshot, clock: () => now, fetchSnapshot: async () => { calls++; return live; } });
  for (const origin of ['https://another.example', 'null', 'not-a-url']) {
    const denied = response(); await api('refresh', request('POST', origin), denied); assert.equal(denied.statusCode, 403);
  }
  assert.equal(calls, 0);
  const fresh = response(); await api('refresh', request(), fresh);
  assert.deepEqual(fresh.body, live);
  const current = response(); await api('rounds', request('GET'), current); assert.deepEqual(current.body, live);
  const limited = response(); await api('refresh', request(), limited); assert.equal(limited.statusCode, 429);
  assert.equal(limited.headers['Retry-After'], '60');
  now = 60000;
  const again = response(); await api('refresh', request(), again); assert.equal(again.statusCode, 200); assert.equal(calls, 2);
});

test('concurrent hosted refreshes share one fetch, and failure preserves the last snapshot', async () => {
  let calls = 0, rejectFetch;
  const api = createHostedApi({ snapshot, fetchSnapshot: () => { calls++; return new Promise((resolve, reject) => { rejectFetch = reject; }); } });
  const a = response(), b = response();
  const first = api('refresh', request(), a), second = api('refresh', request(), b);
  await Promise.resolve(); rejectFetch(new Error('Provider unavailable'));
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.equal(a.statusCode, 502); assert.equal(b.statusCode, 502);
  assert.equal(a.body.retainedSnapshot, true);
  const retained = response(); await api('rounds', request('GET'), retained);
  assert.deepEqual(retained.body, snapshot);
  assert.equal(retained.headers['Cache-Control'], 'no-store');
});
