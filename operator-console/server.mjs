import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { review } from './review.mjs';

const assets = new Map([
  ['/', ['index.html', 'text/html']], ['/app.mjs', ['app.mjs', 'text/javascript']],
  ['/decision.mjs', ['decision.mjs', 'text/javascript']], ['/style.css', ['style.css', 'text/css']],
  ['/core.js', ['../mission-control/core.js', 'text/javascript']]
]);
const hash = value => createHash('sha256').update(value).digest();
const fail = (status, message) => Object.assign(Error(message), { status });

function checkBrief(b) {
  const count = n => Number.isInteger(n) && n >= 0 && n <= 250;
  const title = t => typeof t === 'string' && t.length > 0 && t.length <= 180;
  const date = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
  if (!b || !date(b.date) || typeof b.sample !== 'boolean' || typeof b.simulated !== 'boolean' ||
    !count(b.blocked) || !count(b.ready) || !Array.isArray(b.choices) || !b.choices.length ||
    b.choices.length !== Math.min(b.ready, 3)) throw fail(400, 'Invalid shortlist.');
  const choices = b.choices.map(c => {
    if (!c || !title(c.title) || !(c.due === null || date(c.due)) ||
      !(c.effectiveDeadline === null || date(c.effectiveDeadline)) || !count(c.opensCount) ||
      !count(c.downstream) || !Array.isArray(c.opens) || c.opens.length !== Math.min(c.opensCount, 4) ||
      !c.opens.every(title)) throw fail(400, 'Invalid task summary.');
    return { title: c.title, due: c.due, effectiveDeadline: c.effectiveDeadline,
      opens: c.opens, opensCount: c.opensCount, downstream: c.downstream };
  });
  return { date: b.date, sample: b.sample, simulated: b.simulated, blocked: b.blocked, ready: b.ready, choices };
}

export function makeServer(env, runReview = review) {
  let busy = false, nextReview = 0;
  return createServer(async (req, res) => {
    const send = (status, body, type = 'text/plain') => {
      res.writeHead(status, { 'Content-Type': type + '; charset=utf-8' }); res.end(body);
    };
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    try {
      if (req.method === 'GET' && req.url === '/healthz') return send(200, 'ok');
      const password = env.APERTURE_OPERATOR_PASSWORD;
      if (!password || password.length < 16) return send(503, 'Console locked. Set APERTURE_OPERATOR_PASSWORD in the service environment (16 or more characters).');
      const expected = 'Basic ' + Buffer.from('operator:' + password).toString('base64');
      if (!timingSafeEqual(hash(expected), hash(req.headers.authorization || ''))) {
        res.setHeader('WWW-Authenticate', 'Basic realm="APERTURE", charset="UTF-8"');
        return send(401, 'Sign in as operator.');
      }
      if (req.method === 'GET' && assets.has(req.url)) {
        const [file, type] = assets.get(req.url);
        return send(200, await readFile(new URL(file, import.meta.url)), type);
      }
      if (req.method === 'GET' && req.url === '/settings') return send(200, JSON.stringify({ reviewEnabled: Boolean(env.OPENAI_API_KEY) }), 'application/json');
      if (req.method !== 'POST' || req.url !== '/review') return send(404, 'Unknown route.');
      let origin;
      try { origin = new URL(req.headers.origin); } catch { throw fail(403, 'Open the console to request a review.'); }
      if (!['https:', 'http:'].includes(origin.protocol) || origin.host !== req.headers.host) throw fail(403, 'Invalid request origin.');
      if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw fail(415, 'Expected JSON.');
      if (!env.OPENAI_API_KEY) throw fail(503, 'Add OPENAI_API_KEY to enable AI review.');
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16384) throw fail(413, 'Shortlist is too large.');
        chunks.push(chunk);
      }
      let data;
      try { data = JSON.parse(Buffer.concat(chunks).toString()); } catch { throw fail(400, 'Invalid JSON.'); }
      const brief = checkBrief(data);
      if (busy || Date.now() < nextReview) throw fail(429, 'Wait a minute before requesting another review.');
      busy = true;
      nextReview = Date.now() + 60000;
      try {
        const advice = await runReview(brief, env.OPENAI_API_KEY, env.OPENAI_REVIEW_MODEL || 'gpt-6-astra');
        send(200, JSON.stringify({ advice }), 'application/json');
      } catch (e) {
        const hint = {401: 'Check the OpenAI key in Render.', 403: 'Check project permissions and model access.',
          404: 'Check model availability for this project.', 429: 'Check API credits and rate limits.'}[e.status];
        throw fail(502, 'AI review did not finish. ' + (hint || 'Try again later.'));
      } finally { busy = false; }
    } catch (err) {
      if (!res.headersSent) send(err.status || 500, err.status ? err.message : 'Console request failed.');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  makeServer(process.env).listen(Number(process.env.PORT || 3000), '0.0.0.0');
}
