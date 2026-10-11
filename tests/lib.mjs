// Shared helpers for headless tests (Playwright + Chromium).
// Serves the repo from disk at http://app.local/ and maps the three.js CDN to a local copy when THREE_JS is set.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const PW = process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright/index.mjs';
export const { chromium } = await import(PW);
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

export const VIEWPORTS = {
  desktop: { viewport: { width: 1400, height: 900 } },
  phone: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

export async function openPage(browser, vp, errors, name) {
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`${name}: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`${name} console: ${m.text()}`); });
  await page.route('**/*', r => {
    const u = new URL(r.request().url());
    if (u.hostname === 'cdnjs.cloudflare.com' && process.env.THREE_JS) return r.fulfill({ path: process.env.THREE_JS, contentType: 'text/javascript' });
    if (u.hostname !== 'app.local') return u.hostname === 'cdnjs.cloudflare.com' ? r.continue() : r.abort();
    let p = path.join(ROOT, decodeURIComponent(u.pathname)); if (p.endsWith('/')) p += 'index.html';
    if (!fs.existsSync(p)) return r.fulfill({ status: 404, body: 'not found' });
    r.fulfill({ path: p, contentType: (MIME[path.extname(p)] || 'application/octet-stream') + '; charset=utf-8' });
  });
  await page.goto('http://app.local/');
  await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 });
  return { ctx, page };
}

/* Bench helpers: everything goes through real pointer events on the SVG, like a student would. */
export function bench(page) {
  const H = {
    L: () => page.evaluate(() => BENCH.sim.RT.layout),
    focus: async d => { await page.evaluate(d => BENCH.focus(d), d); await page.waitForTimeout(d === 'board' ? 700 : 80); },
    toClient: (x, y) => page.evaluate(([x, y]) => { const s = document.getElementById('bench'); const p = s.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(s.getScreenCTM()); return [q.x, q.y]; }, [x, y]),
    tap: async (x, y) => { const [cx, cy] = await H.toClient(x, y); if (H.touch) await page.touchscreen.tap(cx, cy); else await page.mouse.click(cx, cy); await page.waitForTimeout(25); },
    key: async (k, times = 1) => { for (let i = 0; i < times; i++) {
      const c = await page.evaluate(k => { const e = document.querySelector(`#bench [data-k="${k}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, innerWidth, innerHeight]; }, k);
      if (!c) throw new Error('no control ' + k);
      if (c[0] < 0 || c[1] < 0 || c[0] > c[2] || c[1] > c[3]) throw new Error(`control ${k} off screen`);
      if (H.touch) await page.touchscreen.tap(c[0], c[1]); else await page.mouse.click(c[0], c[1]); await page.waitForTimeout(20); } },
    node: async i => { const L = await H.L(); return { x: L.BX + 44 + (i % L.COLS) * L.P, y: L.BY + 44 + Math.floor(i / L.COLS) * L.P }; },
    bag: async t => { if (!(await page.evaluate(() => BENCH.drawer))) { await page.evaluate(() => BENCH.setDrawer(true)); await page.waitForTimeout(100); }
      const b = await page.$(`#bag .bag-item[data-t="${t}"]`); const r = await b.boundingBox(); if (H.touch) await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(40); },
    place: async (t, a, b) => { await H.bag(t); const A = await H.node(a), B = await H.node(b); await H.tap((A.x + B.x) / 2, (A.y + B.y) / 2); },
    drag: async (from, to) => { const [x0, y0] = await H.toClient(from.x, from.y); const [x1, y1] = await H.toClient(to.x, to.y); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(40); },
    lead: async (k, node) => { const p = await page.evaluate(k => { const s = document.getElementById('bench'); const e = s.querySelector(`[data-k="lead:${k}"]`); return { x: +e.getAttribute('cx'), y: +e.getAttribute('cy') }; }, k); await H.drag(p, await H.node(node)); },
    leadAt: k => page.evaluate(k => BENCH.sim.RT.S.leads[k].node, k),
    select: async (a, b) => { const sel = await page.evaluate(([a, b]) => { const S = BENCH.sim.RT.S; const p = S.parts.find(q => (q.a === a && q.b === b) || (q.a === b && q.b === a)); return p && S.sel === p.id; }, [a, b]);
      if (sel) return; const A = await H.node(a), B = await H.node(b); await H.tap((A.x + B.x) / 2, (A.y + B.y) / 2); },
    flip: async (a, b) => { await H.select(a, b); await H.key('tb:flip'); },
    del: async (a, b) => { await H.select(a, b); await H.key('tb:del'); },
    gen: async (fk, digits, uk) => { await H.key('g:' + fk); for (const d of digits) await H.key('g:' + d); await H.key('g:' + uk); },
    steps: () => page.evaluate(() => ({ done: BENCH.done.filter(Boolean).length, total: BENCH.sim.steps.length, cur: BENCH.cur() })),
    S: f => page.evaluate(f),
  };
  return H;
}
export async function sit(page, id, mode) {
  await page.click('#quickBtn'); await page.click('#quick [data-lab="ee312"]'); await page.click(`#quick [data-exp="${id}"]`);
  await page.waitForSelector('#seatModal:not([hidden])', { timeout: 8000 });
  await page.click(`#seatModal button[data-mode="${mode}"]`);
  await page.waitForFunction(() => !document.querySelector('#benchView').hidden && BENCH.sim, null, { timeout: 8000 }); await page.waitForTimeout(400);
}
