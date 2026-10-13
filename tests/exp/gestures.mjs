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
      if (e && e.closest('#bench') && !e.closest('[data-k]')) { const q = BENCH.toSvg(x, y); if (!BENCH.regionAt(q)) return { x, y }; } } return null; });
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
  await zoomIn(10); for (let i = 0; i < 20; i++) { if (touch) await pinch(mid, 120, 30); else { await page.mouse.move(mid.x, mid.y); await page.mouse.wheel(0, 500); } }
  const s5 = await st(); ok(Math.abs(s5.w - s5.fw) < 1, 'zooming out stops at the fitted desk');
  await zoomIn(2); await page.click('#bFit'); await page.waitForTimeout(700); const s6 = await st(); ok(!s6.user && Math.abs(s6.w - s6.fw) < 1, '«عرض كامل» refits');
  // board zoom: a tap on the panel's frame (not a hole) zooms onto the board; the parts box stays; pinch goes closer there too
  { const R = await page.evaluate(() => BENCH.sim.boardRect); const c = await page.evaluate(([x, y]) => { const s = document.getElementById('bench'); const p = s.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(s.getScreenCTM()); return [q.x, q.y]; }, [R[0] + 6, R[1] + R[3] / 2]);
    if (touch) await page.touchscreen.tap(c[0], c[1]); else await page.mouse.click(c[0], c[1]); await page.waitForTimeout(700);
    const b = await page.evaluate(() => { const s = document.getElementById('bench'), st = document.getElementById('bstage').getBoundingClientRect(), pd = BENCH.pads(), R = BENCH.sim.boardRect, m = s.getScreenCTM();
      return { view: BENCH.view, fill: Math.max(R[2] * m.a / (st.width - pd.left), R[3] * m.d / (st.height - pd.top - pd.bottom)), box: getComputedStyle(document.getElementById('drawer')).display !== 'none' }; });
    ok(b.view === 'board' && b.fill > 0.86 && b.box, `tapping the board's frame zooms onto the board (${(b.fill * 100).toFixed(0)} % of the free area), parts box still there`);
    const w0 = (await st()).w; await zoomIn(1); ok((await st()).w < w0 * 0.8, 'pinch / wheel goes closer inside the board zoom');
    await page.keyboard.press('Escape'); await page.waitForTimeout(600); }
  // inside a device zoom
  await page.evaluate(() => BENCH.focus('sc')); await page.waitForTimeout(700); const d0 = await st();
  await zoomIn(2); const d1 = await st(); ok(d1.view === 'sc' && d1.w < d0.w * 0.8, `inside the scope zoom, ${touch ? 'pinch' : 'wheel'} goes closer (${Math.round(d0.w)} → ${Math.round(d1.w)})`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700); const d2 = await st(); ok(d2.view === 'ov' && !d2.user && Math.abs(d2.w - d2.fw) < 1, '✕ / ESC back to the fitted overview');
  // ?debug=1: the real viewport numbers on screen (and nothing without it)
  ok(await page.evaluate(() => !document.getElementById('dbgOverlay')), 'no debug overlay without ?debug=1');
  await page.goto('http://app.local/?debug=1'); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 }); await page.evaluate(() => WELCOME.close());
  await sit(page, 'ee312/exp9', 'free'); await page.waitForTimeout(600);
  const dbg = await page.$eval('#dbgOverlay', e => e.textContent); ok(/visualViewport \d/.test(dbg) && /safe-area/.test(dbg) && /free rect/.test(dbg) && /fitted bbox/.test(dbg) && /iframe/.test(dbg), '?debug=1 overlay prints the viewport, safe areas, free rect and fitted bbox');
}
