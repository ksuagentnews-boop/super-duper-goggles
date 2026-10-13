// Shared helpers for headless tests (Playwright + Chromium).
// Serves the repo from disk at http://app.local/ and maps the three.js CDN to a local copy when THREE_JS is set.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
// Playwright: PLAYWRIGHT_MODULE if set, else the project's own `npm install`, else the cloud workspace copy.
async function loadPW(){
  if (process.env.PLAYWRIGHT_MODULE) return import(process.env.PLAYWRIGHT_MODULE);
  try { return await import('playwright'); } catch (e) { return import('/opt/node-tools/node_modules/playwright/index.mjs'); }
}
export const { chromium } = await loadPW();
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

export const VIEWPORTS = {
  desktop: { viewport: { width: 1400, height: 900 } },
  phone: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  portrait: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  phone2: { viewport: { width: 932, height: 430 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  /* real phones with the host app's bars / browser chrome: less height than the bare screen */
  appbar: { viewport: { width: 844, height: 330 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  se: { viewport: { width: 667, height: 375 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  android: { viewport: { width: 740, height: 360 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  ipad: { viewport: { width: 1180, height: 820 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
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
  if (await page.$eval('#welcome', e => !e.hidden)) await page.click('#wlStart');
  return { ctx, page };
}

/* Bench helpers: everything goes through real pointer events on the SVG, like a student would. */
export function bench(page) {
  const H = {
    L: () => page.evaluate(() => BENCH.sim.RT.layout),
    focus: async d => { await page.evaluate(d => BENCH.focus(d), d); await page.waitForTimeout(d === 'board' ? 700 : 80); },
    toClient: (x, y) => page.evaluate(([x, y]) => { const s = document.getElementById('bench'); const p = s.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(s.getScreenCTM()); return [q.x, q.y]; }, [x, y]),
    tap: async (x, y) => { await H.unzoom(); const [cx, cy] = await H.toClient(x, y); if (H.touch) await page.touchscreen.tap(cx, cy); else await page.mouse.click(cx, cy); await page.waitForTimeout(25); },
    key: async (k, times = 1) => { for (let i = 0; i < times; i++) {
      const c = await page.evaluate(k => { const e = document.querySelector(`#bench [data-k="${k}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, innerWidth, innerHeight]; }, k);
      if (!c) throw new Error('no control ' + k);
      if (c[0] < 0 || c[1] < 0 || c[0] > c[2] || c[1] > c[3]) throw new Error(`control ${k} off screen`);
      if (H.touch) await page.touchscreen.tap(c[0], c[1]); else await page.mouse.click(c[0], c[1]); await page.waitForTimeout(20); } },
    node: async i => { const L = await H.L(); return { x: L.BX + 44 + (i % L.COLS) * L.P, y: L.BY + 44 + Math.floor(i / L.COLS) * L.P }; },
    /* a device zoom shows only that device: leave it before working on the board, as a student would */
    unzoom: async () => { if (await page.evaluate(() => { if (!document.getElementById('benchView').classList.contains('devzoom')) return false; BENCH.back(); return true; })) await page.waitForTimeout(60); },
    bag: async t => { await H.unzoom(); if (!(await page.evaluate(() => BENCH.drawer))) { await page.evaluate(() => BENCH.setDrawer(true)); await page.waitForTimeout(100); }
      const b = await page.$(`#bag .bag-item[data-t="${t}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await page.waitForTimeout(30); const r = await b.boundingBox(); if (H.touch) await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(40); },
    /* drop a diode from the parts box straight onto a multimeter's HI / COM jacks */
    jack: async (t, key = 'dmm') => { await H.bag(t); const c = await page.evaluate(k => { const L = BENCH.sim.RT.layout, i = BENCH.sim.RT.inst[k]; const P = L.POS[k], r = i.jackSlot; return { x: P.x + r.x + r.w / 2, y: P.y + r.y + r.h / 2 }; }, key); await H.tap(c.x, c.y); },
    place: async (t, a, b) => { await H.bag(t); const A = await H.node(a), B = await H.node(b); await H.tap((A.x + B.x) / 2, (A.y + B.y) / 2); },
    drag: async (from, to) => { await H.unzoom(); const [x0, y0] = await H.toClient(from.x, from.y); const [x1, y1] = await H.toClient(to.x, to.y); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(40); },
    /* plug a free lead of the right kind into the jack of lead key k: drag its head from the tray; it snaps in */
    plugJack: async k => { const j = await page.evaluate(k => { const R = BENCH.sim.RT, g = R.lead.grpOf(k); if (R.S.jack[g]) return null; const id = R.lead.leadFor(g); if (id < 0) return null; return { a: R.lead.headPos(id), b: R.lead.jackAt(g) }; }, k);
      if (j) await H.drag(j.a, { x: j.b.x + 6, y: j.b.y + 4 }); },
    /* move the clip that serves lead key k (CH1, CH1 ⏚, L +, HI …) to a panel node (null = off the board) */
    /* leads live in the tray / on the rack: work on them from the overview, as a student would */
    toOv: async () => { if (await page.evaluate(() => { if (BENCH.view === 'ov') return false; BENCH.back(); return true; })) await page.waitForTimeout(60); },
    lead: async (k, node) => { await H.toOv(); if (node != null) await H.plugJack(k); const p = await page.evaluate(k => BENCH.sim.RT.lead.leadPos(k), k); if (!p) return;
      const to = node == null ? await page.evaluate(() => { const L = BENCH.sim.RT.layout; return { x: L.BX - 40, y: L.parkY - 30 }; }) : await H.node(node); await H.drag(p, to); },
    leadAt: k => page.evaluate(k => BENCH.sim.RT.S.leads[k].node, k),
    select: async (a, b) => { const sel = await page.evaluate(([a, b]) => { const S = BENCH.sim.RT.S; const p = S.parts.find(q => (q.a === a && q.b === b) || (q.a === b && q.b === a)); return p && S.sel === p.id; }, [a, b]);
      if (sel) return; const A = await H.node(a), B = await H.node(b); await H.tap((A.x + B.x) / 2, (A.y + B.y) / 2); },
    flip: async (a, b) => { await H.select(a, b); await H.key('tb:flip'); },
    del: async (a, b) => { await H.select(a, b); await H.key('tb:del'); },
    /* multi-pin part: arm it from the bag, tap the centre of its footprint (pins: [[dx,dy],…] from the anchor node) */
    placeIC: async (t, anchor, pins) => { await H.bag(t); const L = await H.L(); const ps = await Promise.all(pins.map(([dx, dy]) => H.node(anchor + dy * L.COLS + dx)));
      await H.tap(ps.reduce((a, p) => a + p.x, 0) / ps.length, ps.reduce((a, p) => a + p.y, 0) / ps.length); },
    wire: async (a, b) => { await H.bag('W'); const A = await H.node(a), B = await H.node(b); await H.tap(A.x, A.y); await H.tap(B.x, B.y); await H.bag('W'); },
    delWire: async (a, b) => { const p = await page.evaluate(([a, b]) => { const S = BENCH.sim.RT.S; const w = S.wires.find(q => (q.a === a && q.b === b) || (q.a === b && q.b === a)); if (!w) return null;
        const e = document.querySelector(`#bench [data-k="wire:${w.id}"]`); const pt = e.getPointAtLength(e.getTotalLength() / 2); return { x: pt.x, y: pt.y }; }, [a, b]);
      if (!p) throw new Error('no wire'); await H.tap(p.x, p.y); await H.key('tb:del'); },
    gen: async (fk, digits, uk) => { await H.key('g:' + fk); for (const d of digits) await H.key('g:' + d); await H.key('g:' + uk); },
    steps: () => page.evaluate(() => ({ done: BENCH.done.filter(Boolean).length, total: BENCH.sim.steps.length, cur: BENCH.cur() })),
    S: f => page.evaluate(f),
  };
  return H;
}
export async function sit(page, id, mode, procs) {
  await page.click('#quickBtn'); await page.click('#quick [data-level="6"]'); await page.click('#quick [data-lab="ee312"]'); await page.click(`#quick [data-exp="${id}"]`);
  await page.waitForSelector('#seatModal:not([hidden])', { timeout: 8000 });
  await page.click(`#seatModal button[data-mode="${mode}"]`);
  await page.waitForFunction(() => !document.querySelector('#benchView').hidden && BENCH.sim, null, { timeout: 8000 }); await page.waitForTimeout(400);
  /* Manual: the procedure picker opens with every procedure ticked; procs = the ones to keep (default all) */
  if (await page.evaluate(() => !document.getElementById('procPick').hidden)) {
    if (procs) await page.evaluate(p => document.querySelectorAll('#ppList input').forEach(i => { i.checked = p.includes(i.value); }), procs);
    await page.click('#ppGo'); await page.waitForTimeout(200); }
}
