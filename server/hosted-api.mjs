import { readFileSync } from 'node:fs';
import { fireroundAdapter, providers } from './adapters.mjs';

// Each serverless instance has its own disposable cache. Cold starts restore
// the saved sample, retaining its actual collection timestamp.
export function createHostedApi({ snapshot, fetchSnapshot = () => fireroundAdapter.fetch(), clock = Date.now }) {
  let current = snapshot;
  let pending = null;
  let lastAttempt = -Infinity;
  const json = (res, status, body) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.statusCode = status;
    res.end(JSON.stringify(body));
  };
  return async function handle(action, req, res) {
    const method = action === 'refresh' ? 'POST' : 'GET';
    if (req.method !== method) {
      res.setHeader('Allow', method);
      return json(res, 405, { error: 'Method not allowed' });
    }
    if (action === 'rounds') return json(res, 200, current);
    if (action === 'providers') return json(res, 200, providers);
    if (action !== 'refresh') return json(res, 404, { error: 'API endpoint not found' });
    // Same-site requests work for preview URLs and custom domains alike.
    // This is not authentication or a distributed rate limit.
    if (req.headers.origin) {
      let allowed = false;
      try {
        const origin = new URL(req.headers.origin);
        allowed = ['http:', 'https:'].includes(origin.protocol) && origin.host === req.headers.host;
      } catch { /* Invalid origins are rejected. */ }
      if (!allowed) return json(res, 403, { error: 'Refresh must be requested from this dashboard.' });
    }
    if (!pending && clock() - lastAttempt < 60000) {
      res.setHeader('Retry-After', String(Math.ceil((60000 - (clock() - lastAttempt)) / 1000)));
      return json(res, 429, { error: 'Please wait one minute between refreshes. Your last snapshot is still available.' });
    }
    if (!pending) {
      lastAttempt = clock();
      pending = Promise.resolve().then(fetchSnapshot).then(data => (current = data)).finally(() => { pending = null; });
    }
    try {
      return json(res, 200, await pending);
    } catch (error) {
      return json(res, 502, { error: error.message || 'Unable to refresh the provider.', retainedSnapshot: true });
    }
  };
}

export const hostedApi = createHostedApi({
  snapshot: JSON.parse(readFileSync(new URL('../public/data/snapshot.json', import.meta.url), 'utf8')),
});
