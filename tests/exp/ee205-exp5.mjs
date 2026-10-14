import { sit, bench } from '../lib.mjs';
/* EE205 Exp 5: balanced Y load on the three-phase transformer, single wattmeter, the 3Φ key; full-marks grading */
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp5', 'manual');
  const H = bench(page); H.touch = vp !== 'desktop';
  const status = () => page.evaluate(() => { const s = BENCH.sim.status(); return { ST: s.ST, r: s.r, on: s.on, star: s.star, fig7: s.fig7, fig8: s.fig8, fig9: s.fig9 }; });
  const done = async n => (await H.steps()).done >= n;
  const power = async () => { await H.chk(); await H.focus('x3'); await H.key('x:PWR'); };
  const off = async () => { if (await page.evaluate(() => BENCH.sim.RT.S.x3.pwr)) { await H.focus('x3'); await H.key('x:PWR'); } };
  await H.focus('board'); for (const [k, n] of [['r1a', 4], ['r1b', 20], ['r2a', 18], ['r2b', 20], ['r3a', 32], ['r3b', 20]]) await H.lead(k, n);
  ok(await done(1), 'I star load');
  /* set a rheostat to 100 Ω like a student: drag its slider along the rail, then the last ohms with the wheel (mouse) or the ◀ ▶ pad (touch) */
  const setR = async i => { await H.focus('rh');
    const sl = () => page.evaluate(i => { const e = document.querySelector(`#bench [data-k="slide:r:S${i}"]`); const r = e.getBoundingClientRect(); const m = document.getElementById('bench').getScreenCTM(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, k: m.d }; }, i);
    for (let k = 0; k < 4; k++) { const r = (await status()).r[i - 1]; if (r === 100) break; const a = await sl(); const dy = (r - 100) * (310 / 330) * a.k;
      if (H.touch) { const cdp = await page.context().newCDPSession(page); const T = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: a.x, y }] }); await T('touchStart', a.y); for (let j = 1; j <= 6; j++) await T('touchMove', a.y + dy * j / 6); await T('touchEnd'); await cdp.detach(); }
      else { await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x, a.y + dy, { steps: 6 }); await page.mouse.up(); }
      await page.waitForTimeout(40); }
    for (let k = 0; k < 12; k++) { const r = (await status()).r[i - 1]; if (r === 100) return; const a = await sl();
      if (!H.touch) { await page.mouse.move(a.x, a.y); await page.mouse.wheel(0, r < 100 ? -100 : 100); }
      else { await page.touchscreen.tap(a.x, a.y); await page.waitForTimeout(60); const b = await page.evaluate(d => { const e = document.querySelector(`#kpad:not([hidden]) .kb[data-d="${d}"]`); if (!e) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, r < 100 ? '+' : '-');
        if (b) { await page.touchscreen.tap(b[0], b[1]); await page.evaluate(() => BENCH.sim.RT.closePad()); } }
      await page.waitForTimeout(30); } };
  for (const [i, x] of [[1, 4], [2, 18], [3, 32]]) { await setR(i); await H.lead('h5v', x); await H.lead('h5c', 20); }
  ok(await done(2), `I rheostats at 100 Ω ${JSON.stringify(await status())}`);
  for (const [k, n] of [['x3a', 0], ['x3b', 14], ['x3c', 28], ['h1ma', 0], ['h1c', 4], ['h2ma', 14], ['h2c', 18], ['h3ma', 28], ['h3c', 32], ['h4v', 0], ['h4c', 14]]) await H.lead(k, n);
  ok(await done(3), `I Fig. 7 built ${JSON.stringify(await status())}`);
  await power(); for (const n of [1, 2, 3]) { await H.focus('hm' + n); await H.key(`h${n}:SW+`, 7); } await H.focus('hm5'); await H.key('h5:SW-', 3); await H.focus('hm4'); await H.key('h4:SW-');
  ok(await done(4), 'I powered by the instructor');
  await H.lead('h5v', 4); await H.lead('h5c', 20); ok(await done(5), `I readings ${JSON.stringify((await status()).ST)}`);
  await off(); ok(await page.evaluate(() => !BENCH.sim.RT.layout.regions.hm2 && !!BENCH.sim.RT.layout.regions.pw1 && !BENCH.sim.RT.S.jack.h2ma), 'Procedure II: M2–M5 left the table (their leads back in the tray), the PX 120 came');
  for (const [k, n] of [['x3b', 18], ['x3c', 32], ['w1i', 0], ['w1ic', 2], ['h1ma', 2], ['w1v', 2], ['w1vc', 20], ['x3n', 20]]) await H.lead(k, n);
  ok(await done(6), `II Fig. 8 built ${JSON.stringify(await status())}`);
  await power(); await H.focus('pw1'); await H.key('w1:PWR'); ok(await done(7), `II PA ${JSON.stringify((await status()).ST)}`);
  await off(); await H.lead('x3n', null); await H.lead('w1vc', 14); ok(await done(8), 'III Fig. 9 built');
  await power(); await H.focus('pw1'); await H.key('w1:TRI'); ok(await done(9), `III 3Φ ${JSON.stringify((await status()).ST)}`);
  await page.screenshot({ path: `/tmp/ee205-exp5-${vp}.png` });
  await off(); ok(await done(10), 'all steps done');
  const S = (await status()).ST;
  const F = await page.evaluate(S => { const f = {}, r = (x, d) => (+x).toFixed(d);
    f.ra = r(S.ra, 1); f.rb = r(S.rb, 1); f.rc = r(S.rc, 1); f.ia = r(S.ia * 1e3, 1); f.ib = r(S.ib * 1e3, 1); f.ic = r(S.ic * 1e3, 1); f.vl = r(S.vl, 2); f.vp = r(S.vp, 2); f.ratio = r(+f.vl / +f.vp, 3);
    f.pa = r(S.pa, 2); f.pt = r(3 * +f.pa, 2); f.ia2 = r(S.ia2 * 1e3, 1); f.pt2 = r(3 * (+f.ia2 / 1e3) ** 2 * 100, 2); f.p3 = r(S.p3, 2); f.pdiff = r((+f.p3 - +f.pt) / +f.pt * 100, 1); return f; }, S);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('input')); } document.getElementById('submit').click(); }, F);
  const res = await page.evaluate(() => document.querySelector('#result .result b').textContent + ' | ' + [...document.querySelectorAll('#result .bad')].map(e => e.textContent).join(' ; '));
  const m = res.match(/(\d+) \/ (\d+)/); ok(m && m[1] === m[2], 'sheet full marks: ' + res);
}
