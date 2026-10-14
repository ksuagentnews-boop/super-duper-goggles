import { sit } from '../lib.mjs';
/* free pan & zoom of the desk (like a map): wheel / pinch between the fitted view and ≈4× closer, drag on empty desk to
   pan, double-tap or «عرض كامل» to refit; the same inside a device zoom */
export async function run(page, vp, ok) {
  console.log(`[${vp}] pan & zoom`);
  await sit(page, 'ee312/exp9', 'free');
  const touch = vp !== 'desktop';
  const st = () => page.evaluate(() => ({ ...BENCH.vb, user: BENCH.user, fw: BENCH.fit(BENCH.curRect()).w, view: BENCH.view, btn: !document.getElementById('bFit').hidden }));
  const mid = await page.evaluate(() => { const e = document.getElementById('bstage').getBoundingClientRect(); return { x: e.x + e.width * 0.55, y: e.y + e.height * 0.45 }; });
  const empty = () => page.evaluate(() => { const s = document.getElementById('bstage').getBoundingClientRect();
    for (let y = s.top + 30; y < s.bottom - 30; y += 13) for (let x = s.left + 30; x < s.right - 30; x += 13) { const e = document.elementFromPoint(x, y);
      if (e && e.closest('#bench') && !e.closest('[data-k]')) { const q = BENCH.toSvg(x, y), r = BENCH.regionAt(q); if (!r || (BENCH.view !== 'ov' && BENCH.view !== 'board' && r !== BENCH.view)) return { x, y }; } } return null; });
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const pinch = async (c, from, to) => { const tp = d => [{ x: c.x - d, y: c.y, id: 0 }, { x: c.x + d, y: c.y, id: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(from) });
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(from + (to - from) * i / 8) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(150); };
  const zoomIn = async (times = 1) => { for (let i = 0; i < times; i++) { if (touch) await pinch(mid, 40, 110); else { await page.mouse.move(mid.x, mid.y); await page.mouse.wheel(0, -400); } } await page.waitForTimeout(120); };
  const s0 = await st();
  await zoomIn(); const s1 = await st();
  ok(s1.w < s0.w * 0.8 && s1.user && s1.btn && s1.view === 'ov', `${touch ? 'pinch' : 'wheel'} zooms the desk in (${Math.round(s0.w)} → ${Math.round(s1.w)}), «عرض كامل» appears`);
  await zoomIn(8); const s2 = await st();
  ok(Math.abs(s2.w - s2.fw / 4) < 1, `zoom stops at ≈4× (${(s2.fw / s2.w).toFixed(2)}×)`);
  const e = await empty(); ok(!!e, 'found empty desk to drag');
  if (e) { if (touch) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: e.x, y: e.y, id: 0 }] });
      for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: e.x - i * 12, y: e.y - i * 6, id: 0 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    else { await page.mouse.move(e.x, e.y); await page.mouse.down(); await page.mouse.move(e.x - 72, e.y - 36, { steps: 6 }); await page.mouse.up(); }
    await page.waitForTimeout(100); const s3 = await st();
    ok(s3.x > s2.x + 1 && s3.view === 'ov' && Math.abs(s3.w - s2.w) < 1e-6, `dragging empty desk pans (Δx ${(s3.x - s2.x).toFixed(0)}, Δy ${(s3.y - s2.y).toFixed(0)}), no zoom onto a device`); }
  const e2 = await empty();
  if (e2) { if (touch) { await page.touchscreen.tap(e2.x, e2.y); await page.waitForTimeout(60); await page.touchscreen.tap(e2.x, e2.y); } else await page.mouse.dblclick(e2.x, e2.y);
    await page.waitForTimeout(700); const s4 = await st(); ok(!s4.user && Math.abs(s4.w - s4.fw) < 1 && !s4.btn, `double-tap on empty desk refits the whole desk`); }
  await zoomIn(10); const eo = (await empty()) || mid; for (let i = 0; i < 20; i++) { if (touch) await pinch(mid, 120, 30); else { await page.mouse.move(eo.x, eo.y); await page.mouse.wheel(0, 500); } }
  const s5 = await st(); ok(Math.abs(s5.w - s5.fw) < 1, 'zooming out stops at the fitted desk');
  await zoomIn(2); await page.click('#bFit'); await page.waitForTimeout(700); const s6 = await st(); ok(!s6.user && Math.abs(s6.w - s6.fw) < 1, '«عرض كامل» refits');
  // knobs: on touch a drag turns them, a tap shows big − / + buttons with the value; on desktop the wheel turns them
  { await page.evaluate(() => { BENCH.fitAll(); const S = BENCH.sim.RT.S; S.psu.pwr = true; S.psu.u[0].v = 5; BENCH.sim.render(); }); await page.waitForTimeout(300);
    /* a knob drawn tiny (portrait overview of a crowded table) is reached through the supply's device zoom, as a student would */
    await page.evaluate(() => { const c = document.querySelector('#bench circle[data-knob="p:LVC"][stroke]').getBoundingClientRect(); if (c.width < 16) BENCH.focus('psu'); }); await page.waitForTimeout(500);
    const k = await page.evaluate(() => { const c = document.querySelector('#bench circle[data-knob="p:LVC"][stroke]').getBoundingClientRect(); return { x: c.x + c.width / 2, y: c.y + c.height / 2 }; });
    const v = () => page.evaluate(() => BENCH.sim.RT.S.psu.u[0].v);
    if (touch) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: k.x, y: k.y, id: 0 }] });
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: k.x + i * 9, y: k.y, id: 0 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const v1 = await v(); ok(Math.abs(v1 - 5.5) < 1e-9, `a finger drag of 72 px across the COARSE knob turns it 5 detents (5.00 → ${v1.toFixed(2)} V)`);
      await page.touchscreen.tap(k.x, k.y); await page.waitForTimeout(150);
      const pad = await page.evaluate(() => { const e = document.getElementById('kpad'); return { shown: !e.hidden, val: e.querySelector('.kv').textContent, b: [...e.querySelectorAll('.kb')].map(x => Math.min(x.getBoundingClientRect().width, x.getBoundingClientRect().height)) }; });
      ok(pad.shown && pad.b.length === 2 && Math.min(...pad.b) >= 44 && /5\.50 V/.test(pad.val), `a tap on the knob shows big − / + buttons (${pad.b.join(', ')} px) and its value «${pad.val}»`);
      const plus = await page.evaluate(() => { const r = document.querySelector('#kpad .kb[data-d="+"]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await page.touchscreen.tap(plus[0], plus[1]); await page.waitForTimeout(100);
      ok(Math.abs(await v() - 5.6) < 1e-9 && /5\.60 V/.test(await page.evaluate(() => document.querySelector('#kpad .kv').textContent)), '+ turns it one detent and the value follows');
      const e3 = await empty(); if (e3) { await page.touchscreen.tap(e3.x, e3.y); await page.waitForTimeout(150); } ok(await page.evaluate(() => document.getElementById('kpad').hidden), 'a tap elsewhere hides the buttons'); }
    else { await page.mouse.move(k.x, k.y); await page.mouse.wheel(0, -100); await page.waitForTimeout(80); ok(Math.abs(await v() - 5.1) < 1e-9, 'desktop: the wheel over the knob body turns it'); } }
  await page.evaluate(() => { if (BENCH.view !== 'ov') BENCH.back(); BENCH.fitAll(); }); await page.waitForTimeout(400);
  // board zoom: a tap on the panel's frame (not a hole) zooms onto the board; the parts box stays; pinch goes closer there too
  { // the board's frame is a thin border: a tap 40 units outside the panel's edge reaches the desk, not the board zoom
    const R0 = await page.evaluate(() => BENCH.sim.boardRect); const c0 = await page.evaluate(([x, y]) => { const s = document.getElementById('bench'); const p = s.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(s.getScreenCTM()); return [q.x, q.y]; }, [R0[0] - 40, R0[1] + R0[3] / 2]);
    const reg = await page.evaluate(([x, y]) => { const q = BENCH.toSvg(x, y); return BENCH.regionAt(q); }, c0);
    ok(reg !== 'board', `the board's zoom frame is a thin border round the panel (40 units beside it: ${reg || 'desk'})`); }
  { const R = await page.evaluate(() => BENCH.sim.boardRect); const c = await page.evaluate(([x, y]) => { const s = document.getElementById('bench'); const p = s.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(s.getScreenCTM()); return [q.x, q.y]; }, [R[0] + 6, R[1] + R[3] / 2]);
    if (touch) await page.touchscreen.tap(c[0], c[1]); else await page.mouse.click(c[0], c[1]); await page.waitForTimeout(700);
    const b = await page.evaluate(() => { const s = document.getElementById('bench'), st = document.getElementById('bstage').getBoundingClientRect(), pd = BENCH.pads(), R = BENCH.sim.boardRect, m = s.getScreenCTM();
      return { view: BENCH.view, fill: Math.max(R[2] * m.a / (st.width - pd.left - (pd.right || 0)), R[3] * m.d / (st.height - pd.top - pd.bottom)), box: getComputedStyle(document.getElementById('drawer')).display !== 'none' }; });
    ok(b.view === 'board' && b.fill > 0.86 && b.box, `tapping the board's frame zooms onto the board (${(b.fill * 100).toFixed(0)} % of the free area), parts box still there`);
    const w0 = (await st()).w; await zoomIn(1); ok((await st()).w < w0 * 0.8, 'pinch / wheel goes closer inside the board zoom');
    await page.keyboard.press('Escape'); await page.waitForTimeout(600); }
  // inside a device zoom
  await page.evaluate(() => BENCH.focus('sc')); await page.waitForTimeout(700); const d0 = await st();
  await zoomIn(2); const d1 = await st(); ok(d1.view === 'sc' && d1.w < d0.w * 0.8, `inside the scope zoom, ${touch ? 'pinch' : 'wheel'} goes closer (${Math.round(d0.w)} → ${Math.round(d1.w)})`);
  if (touch) { // zoomed scope on touch: menus as a big list, and controls with finger-sized targets
    await page.evaluate(() => BENCH.fitAll()); await page.waitForTimeout(300);
    const near = await page.evaluate(() => { const r = document.querySelector('#bench .Linst [data-k="s:Measure"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top - 12 }; });
    await page.evaluate(() => { const sc = BENCH.sim.RT.S.sc; sc.pwr = true; sc.menu = null; BENCH.sim.render(); });
    await page.touchscreen.tap(near.x, near.y); await page.waitForTimeout(250);
    ok(await page.evaluate(() => BENCH.sim.RT.S.sc.menu === 'measure'), 'a tap 12 px off the small Measure key still presses it (finger-sized target)');
    const tm = await page.evaluate(() => { const e = document.getElementById('tmenu'); return { shown: !e.hidden, rows: [...e.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().height)) }; });
    ok(tm.shown && tm.rows.length >= 5 && Math.min(...tm.rows) >= 40, `the Measure menu opens as a big touch list (${tm.rows.length} rows, ≥ ${Math.min(...tm.rows)} px)`);
    const b0 = await page.evaluate(() => { const r = document.querySelector('#tmenu button').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await page.touchscreen.tap(b0[0], b0[1]); await page.waitForTimeout(200);
    ok(await page.evaluate(() => BENCH.sim.RT.S.sc.side === 'add' && /Add Measurement/.test(document.querySelector('#tmenu .tm-t').textContent)), 'picking «Add Measurement» in the list works like the soft key');
    // the VARIABLE knob by finger (the owner's main complaint): drag turns it, a tap shows big ◀ ▶ with the list item, and it still works pinch-zoomed
    await page.evaluate(() => { BENCH.sim.RT.S.sc.list = { kind: 'vi', idx: 0 }; BENCH.sim.render(); }); await page.waitForTimeout(100);
    const vk = () => page.evaluate(() => { const c = document.querySelector('#bench circle[data-knob="s:VAR"][stroke]').getBoundingClientRect(); return { x: c.x + c.width / 2, y: c.y + c.height / 2 }; });
    const idx = () => page.evaluate(() => BENCH.sim.RT.S.sc.list.idx);
    const turn = async (k, px) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: k.x, y: k.y, id: 0 }] });
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: k.x + px * i / 8, y: k.y, id: 0 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(100); };
    let k = await vk(); await turn(k, 44); const i1 = await idx(); ok(i1 === 3, `zoomed scope: a 44 px finger drag on VARIABLE moves the list 3 items (0 → ${i1})`);
    await page.touchscreen.tap(k.x, k.y); await page.waitForTimeout(150);
    const vp2 = await page.evaluate(() => { const e = document.getElementById('kpad'); return { shown: !e.hidden, val: e.querySelector('.kv').textContent, b: [...e.querySelectorAll('.kb')].map(x => Math.min(x.getBoundingClientRect().width, x.getBoundingClientRect().height)) }; });
    ok(vp2.shown && Math.min(...vp2.b) >= 44 && vp2.val.length > 0, `a tap on VARIABLE shows big ◀ ▶ (${vp2.b.join(', ')} px) and the item «${vp2.val}»`);
    const mn = await page.evaluate(() => { const r = document.querySelector('#kpad .kb[data-d="-"]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await page.touchscreen.tap(mn[0], mn[1]); await page.waitForTimeout(100);
    ok((await idx()) === 2, '◀ turns it back one item');
    await page.evaluate(k => BENCH.zoomAt(k.x, k.y, 2), k); await page.waitForTimeout(150); k = await vk(); await turn(k, -30);
    ok((await idx()) === 0, 'pinch-zoomed closer, the drag still turns VARIABLE');
    await page.evaluate(() => { BENCH.sim.RT.S.sc.list = null; BENCH.sim.render(); }); }
  await page.keyboard.press('Escape'); await page.waitForTimeout(700); const d2 = await st(); ok(d2.view === 'ov' && !d2.user && Math.abs(d2.w - d2.fw) < 1, '✕ / ESC back to the fitted overview');
  // ?debug=1: the real viewport numbers on screen (and nothing without it)
  if (touch) { // «العلبة» on touch: strip, swipes scroll, parts lift only after a hold or a sideways move
    await page.evaluate(() => { BENCH.back(); BENCH.fitAll(); BENCH.setDrawer(true); }); await page.waitForTimeout(400);
    const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, id: 0 })) });
    const swipe = async (a, b, n = 8, wait = 0) => { await T('touchStart', [a]); if (wait) await page.waitForTimeout(wait); for (let i = 1; i <= n; i++) { await T('touchMove', [[a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]]); await page.waitForTimeout(16); } await T('touchEnd', []); await page.waitForTimeout(120); };
    const bs = () => page.evaluate(() => { const b = document.getElementById('bag'); return { st: b.scrollTop, max: b.scrollHeight - b.clientHeight, armed: BENCH.sim.armed(), parts: BENCH.sim.RT.S.parts.length }; });
    const over = await page.evaluate(() => { const b = document.getElementById('bag'); b.scrollTop = 0; BENCH.bagSync(); return b.scrollHeight > b.clientHeight + 4; });
    if (over) {
      const bar = await page.evaluate(() => { const r = document.getElementById('bagBar').getBoundingClientRect(), d = document.getElementById('drawer').getBoundingClientRect(), c = getComputedStyle(document.getElementById('bagBar'));
        const hit = [...document.querySelectorAll('#bag .bag-item')].some(e => { const q = e.getBoundingClientRect(); return q.right > r.left + 1 && q.left < r.right - 1 && q.bottom > r.top && q.top < r.bottom; });
        return { shown: c.display !== 'none' && r.height > 40, inside: r.right <= d.right + 1 && r.left >= d.left, hit, w: r.width, r: [r.x, r.y, r.width, r.height] }; });
      ok(bar.shown && bar.inside && !bar.hit, `a slim scrollbar strip on the inner edge of «العلبة» (${Math.round(bar.w)} px touch width), covering no part`);
      const it = await page.$eval('#bag .bag-item', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      let b0 = await bs(); await swipe(it, [it[0], it[1] - 90]); let b1 = await bs();
      ok(b1.st >= Math.min(30, b1.max - 1) && !b1.armed && b1.parts === b0.parts, `a vertical swipe on a part scrolls «العلبة» (${Math.round(b1.st)} px) and lifts nothing`);
      const gap = await page.evaluate(() => { const a = [...document.querySelectorAll('#bag .bag-item')].map(e => e.getBoundingClientRect()).filter(r => r.top > document.getElementById('bag').getBoundingClientRect().top);
        return [a[0].x + a[0].width / 2, (a[0].bottom + a[1].top) / 2]; });
      await swipe(gap, [gap[0], gap[1] + 70]); const b2 = await bs(); ok(b2.st < b1.st - Math.min(20, b1.st - 1), 'a swipe on the gaps scrolls too');
      await T('touchStart', [[bar.r[0] + bar.r[2] / 2, bar.r[1] + bar.r[3] - 4]]); await T('touchEnd', []); await page.waitForTimeout(600);
      const b3 = await bs(); ok(b3.st > b3.max - 3, 'a tap on the strip\'s track near the bottom jumps there');
      const thumb = await page.$eval('#bagBar i', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await swipe(thumb, [thumb[0], thumb[1] - bar.r[3]], 10); const b4 = await bs(); ok(b4.st < 3, 'dragging the thumb scrolls back to the top');
      await page.evaluate(() => { document.getElementById('bag').scrollTop = 0; }); }
    const nodeC = (a, b) => page.evaluate(([a, b]) => { const L = BENCH.sim.RT.layout, s = document.getElementById('bench'), m = s.getScreenCTM(); const c = i => ({ x: L.BX + 44 + (i % L.COLS) * L.P, y: L.BY + 44 + Math.floor(i / L.COLS) * L.P });
      const A = c(a), B = c(b); return [((A.x + B.x) / 2) * m.a + m.e, ((A.y + B.y) / 2) * m.d + m.f]; }, [a, b]);
    const item = t => page.$eval(`#bag .bag-item[data-t="${t}"]`, e => { e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    const ts = await page.evaluate(() => [...document.querySelectorAll('#bag .bag-item')].map(e => e.dataset.t).filter(t => t !== 'W'));
    const out = async (a, b) => { await T('touchStart', [a]); for (let i = 1; i <= 4; i++) { await T('touchMove', [[a[0] + 10 * i, a[1]]]); await page.waitForTimeout(16); }
      for (let i = 1; i <= 10; i++) { await T('touchMove', [[a[0] + 40 + (b[0] - a[0] - 40) * i / 10, a[1] + (b[1] - a[1]) * i / 10]]); await page.waitForTimeout(16); } await T('touchEnd', []); await page.waitForTimeout(120); };
    let p0 = (await bs()).parts; await out(await item(ts[1]), await nodeC(0, 1));
    ok((await bs()).parts === p0 + 1, 'a sideways move lifts the part out of «العلبة» and drops it on the board');
    p0 = (await bs()).parts; await swipe(await item(ts[2]), await nodeC(3, 4), 14, 420);
    ok((await bs()).parts === p0 + 1, 'a short hold lifts it too (then it can go any way)');
    const i3 = await item(ts[1]); await page.touchscreen.tap(i3[0], i3[1]); await page.waitForTimeout(80); const a1 = (await bs()).armed;
    await page.touchscreen.tap(i3[0], i3[1]); await page.waitForTimeout(80); const a2 = (await bs()).armed;
    ok(a1 === ts[1] && !a2, 'a tap arms the part, a second tap disarms it');
    await page.evaluate(() => BENCH.sim.reset()); }
  ok(await page.evaluate(() => !document.getElementById('dbgOverlay')), 'no debug overlay without ?debug=1');
  await page.goto('http://app.local/?debug=1'); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 }); await page.evaluate(() => WELCOME.close());
  await sit(page, 'ee312/exp9', 'free'); await page.waitForTimeout(600);
  const dbg = await page.$eval('#dbgOverlay', e => e.textContent); ok(/visualViewport \d/.test(dbg) && /safe-area/.test(dbg) && /free rect/.test(dbg) && /fitted bbox/.test(dbg) && /iframe/.test(dbg), '?debug=1 overlay prints the viewport, safe areas, free rect and fitted bbox');
  // the device zoom is a smooth camera move in and out (no jump cut), with motion allowed
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.reload(); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 }); await page.evaluate(() => WELCOME.close());
  await sit(page, 'ee312/exp9', 'free'); await page.waitForTimeout(500);
  const film = k => page.evaluate(k => new Promise(r => { const out = []; const t0 = performance.now(); if (k) BENCH.focus(k); else BENCH.back(); const f = () => { out.push(BENCH.vb.w); if (performance.now() - t0 < 700) requestAnimationFrame(f); else r(out); }; requestAnimationFrame(f); }), k);
  for (const k of ['sc', null]) { const a = await film(k); const span = Math.abs(a.at(-1) - a[0]) || 1; const steps = a.map((v, i) => i ? Math.abs(v - a[i - 1]) / span : 0);
    ok(steps.filter(x => x > 0.001).length >= 4 && Math.max(...steps) < 0.7, `device zoom ${k ? 'in' : 'out'} is animated (${steps.filter(x => x > 0.001).length} frames, largest step ${(Math.max(...steps) * 100).toFixed(0)} %)`); }
  await page.emulateMedia({ reducedMotion: 'reduce' });
}
