import { sit, bench } from '../lib.mjs';
/* EE205 Exp 2: full Manual run (Procedures I–III) on the Hameg / Metrix / Fluke and full-marks grading */
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp2', 'exam');
  const H = bench(page); H.touch = vp !== 'desktop';
  const st = () => page.evaluate(() => BENCH.sim.status().ST);
  const done = async n => (await H.steps()).done >= n;
  const sc = () => page.evaluate(() => BENCH.sim.RT.S.sc);
  // ---- Procedure I (Figs. 1 and 2 on nodes of their own, not the reference ones) ----
  await H.focus('sc'); await H.key('s:PWR'); await H.key('s:FOC-', 3); ok(await done(1), 'I.1 scope on, focus turned');
  await H.focus('board'); await H.lead('c1r', 2); await H.lead('c1b', 9); await H.lead('Lp', 2); await H.lead('Lm', 9);
  ok(await page.evaluate(() => BENCH.sim.RT.match('1').ok), 'I.2 Fig. 1 matches');
  await H.focus('sc'); await H.key('s:GD1'); await H.key('s:GD1'); await H.key('s:AC1');
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LVC-', 2); await H.key('p:LON');
  await H.key('p:LVC+'); await H.key('p:LVC+', 3); await H.focus('sc'); await H.key('s:V1-', 2); await H.focus('psu'); await H.key('p:LVC+', 5);
  await H.focus('sc'); await H.key('s:V1-'); ok(await done(2), `I.2 zero line, DC, 1/2/5/10 V read ${JSON.stringify(await st())}`);
  await H.focus('psu'); await H.key('p:LON'); ok(await done(3), 'I.3 supply off');
  await H.focus('board'); await H.lead('gr', 4); await H.lead('gb', 11); await H.lead('c2r', 4); await H.lead('c2b', 11);
  await H.focus('sc'); await H.key('s:CH12'); ok(await done(4), 'I.4 Fig. 2 built, CH II shown');
  await H.focus('gen'); await H.key('g:PWR'); await H.key('g:Sine'); await H.mtx('f', 1000); await H.mtx('a', 4); await H.key('g:OUT');
  await H.focus('sc'); await H.key('s:AC2'); await H.key('s:V2+', 2); await H.key('s:TD+', 2);
  ok(await done(6), `I.5 sine on CH II, I.6: ${JSON.stringify((await sc()).ch[1])}`);
  await page.screenshot({ path: `/tmp/ee205-exp2-sine-${vp}.png` });
  await H.focus('hm1'); await H.key('h1:SW-', 3); await H.lead('h1v', 4); await H.lead('h1c', 11); ok(await done(7), 'I.7 DMM Vrms');
  await H.focus('psu'); await H.key('p:LON'); await H.focus('sc'); await H.key('s:DUAL'); await H.key('s:DUAL'); await H.key('s:ADD'); ok(await done(8), 'I.8 DUAL then ADD');
  // ---- Procedure II ----
  await H.key('s:ADD');
  /* the supply leaves the table with Procedure I (its leads go back to the tray) */
  await page.waitForFunction(() => !BENCH.sim.RT.layout.regions.psu, null, { timeout: 5000 }).catch(() => {});
  ok(await page.evaluate(() => !BENCH.sim.RT.layout.regions.psu && !BENCH.sim.RT.S.jack.Lp), 'II: supply left the table');
  await H.lead('c1r', null); await H.lead('c1b', null);
  await H.focus('gen'); await H.mtx('a', 10); await H.mtx('f', 100); ok(await done(9), 'II.1 10 Vpp');
  await H.focus('sc'); await H.key('s:V2-', 3); ok(await done(11), `II.2 10 Vpp on the scope, II.3 DMM ${JSON.stringify((await sc()).ch[1])}`);
  await H.focus('gen'); for (const f of [100, 1000, 2000, 3000, 4000, 5000]) await H.mtx('f', f);
  ok(await done(12), 'II.4 DMM at 100 Hz … 5 kHz');
  // ---- Procedure III ----
  await H.focus('gen'); await H.key('g:OUT');
  for (const k of ['gr', 'gb', 'c2r', 'c2b', 'h1v', 'h1c']) await H.lead(k, null);
  await H.focus('hm1'); await H.key('h1:SW+', 3);
  await H.focus('board'); await H.place('L175', 15, 16); await H.lead('h1v', 16); await H.lead('h1c', 15); ok(await done(13), `III.1 RL ${(await st()).rl}`);
  await H.place('R100', 16, 23); await H.place('BR', 8, 15); await H.lead('gr', 8); await H.lead('gb', 23);
  await H.focus('gen'); await H.mtx('f', 1000); await H.mtx('a', 20); await H.key('g:OUT');
  await H.focus('hm1'); await H.key('h1:SW-', 3);
  for (const [a, b] of [[15, 23], [15, 16], [16, 23]]) { await H.lead('h1v', a); await H.lead('h1c', b); }
  ok(await done(14), `III.2 Fig. 3 built, E, VL, VR: ${JSON.stringify(await st())}`);
  await H.lead('c1r', 16); await H.lead('c1b', 23); await H.lead('c2r', 15); await H.lead('c2b', 23);
  await H.focus('sc'); await H.key('s:DUAL'); ok(await done(15), 'III.3 dual trace VR and E'); await page.screenshot({ path: `/tmp/ee205-exp2-dual-${vp}.png` });
  await H.key('s:XY'); ok(await done(16), 'III.4 XY Lissajous'); await page.screenshot({ path: `/tmp/ee205-exp2-xy-${vp}.png` });
  for (const k of ['c1r', 'c1b', 'c2r', 'c2b', 'h1v', 'h1c']) await H.lead(k, null);
  await H.focus('hm1'); await H.key('h1:SW+', 6); await H.focus('board'); await H.del(8, 15); await H.lead('h1ma', 8); await H.lead('h1c', 15);
  ok(await done(21), `III.5 I = ${JSON.stringify(await st())}, III.6–9`);
  // ---- sheet ----
  const S = await st();
  const F = await page.evaluate(S => { const f = {}, r = (x, d) => (+x).toFixed(d);
    [1, 2, 5, 10].forEach(v => f['dc' + v] = v); f.vm = 2; f.tp = 1; f.fq = 1000; f.vr = r(2 / Math.SQRT2, 3); f.vd = r(S.vrd, 3); f.q8 = 'a'; f.vr8 = r(Math.hypot(10, +f.vr), 3);
    [100, 1000, 2000, 3000, 4000, 5000].forEach(q => { f['r' + q] = 3.535; f['d' + q] = r(S['d' + q], 3); f['e' + q] = ((+f['d' + q] - 3.535) / 3.535 * 100).toFixed(2); });
    f.rl = r(S.rl, 1); f.e3 = r(S.e3, 3); f.vl3 = r(S.vl3, 3); f.vr3 = r(S.vr3, 3); f.th = r(Math.atan2(2 * Math.PI * 17.5, 117.6) * 180 / Math.PI, 1); f.lead = 'e'; f.i3 = r(S.i3 * 1e3, 2);
    f.zm = r(+f.e3 / +f.i3 * 1e3, 1); f.zc = r(Math.hypot(100 + +f.rl, 2 * Math.PI * 17.5), 1); f.p3 = r(Math.pow(+f.i3 / 1e3, 2) * (100 + +f.rl) * 1e3, 2); f.pf = r((100 + +f.rl) / +f.zc, 3); return f; }, S);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('input')); } document.getElementById('submit').click(); }, F);
  const res = await page.evaluate(() => document.querySelector('#result .result b').textContent + ' | ' + [...document.querySelectorAll('#result .bad')].map(e => e.textContent).join(' ; '));
  const m = res.match(/(\d+) \/ (\d+)/); ok(m && m[1] === m[2], 'sheet full marks: ' + res);
}
