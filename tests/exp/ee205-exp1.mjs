import { sit, bench } from '../lib.mjs';
/* EE205 Exp 1: full Manual run (Procedures I–IV) and full-marks grading */
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp1', 'exam');
  const H = bench(page); H.touch = vp !== 'desktop';
  const st = () => page.evaluate(() => BENCH.sim.status().ST);
  const steps = async () => (await H.steps()).done;
  const done = async n => (await steps()) >= n;
  const shown = k => page.evaluate(k => { const m = BENCH.sim.RT.meters().find(q => q.key === k); return m.r.shown; }, k);
  // ---- Procedure I ----
  await H.focus('hm1'); await H.key('h1:SW+', 2);
  await H.focus('board'); await H.place('RC1', 0, 1); await H.lead('h1v', 0); await H.lead('h1c', 1);
  ok(!!(await st()).rRC1, `I.1 Resistor 1 measured: ${JSON.stringify(await shown('hm1'))}`);
  await H.del(0, 1); await H.place('RC2', 3, 4); await H.lead('h1v', 4); await H.lead('h1c', 3); ok(!!(await st()).rRC2, 'I.1 Resistor 2 measured (elsewhere, leads swapped)');
  await H.del(3, 4); await H.place('RC3', 0, 1); await H.lead('h1v', 0); await H.lead('h1c', 1); ok(await done(1), 'I.1 Resistor 3 measured — step 1 done');
  await H.del(0, 1); await H.lead('y1H', 1); await H.lead('y1L', 0);
  const dials = async target => { const d = await page.evaluate(() => BENCH.sim.RT.S.yew1.d.slice());
    for (let j = 0; j < 6; j++) { const want = target[j] || 0; while (d[j] !== want) { await H.key(`y1:D${j}${d[j] < want ? '+' : '-'}`); d[j] += d[j] < want ? 1 : -1; } } };
  await H.focus('yew1');
  const BOX = [[0, 4], [1, 5], [2, 7], [3, 5], [4, 3]];
  for (const [j, n] of BOX) { const t = [0, 0, 0, 0, 0, 0]; t[j] = n; await dials(t); }
  ok(await done(4), `I.2 Table 3 five readings (box reversed on the meter), I.3–4 calculations: ${JSON.stringify(await st())}`);
  // ---- Procedure II (the decade box leaves the table, its leads back in the tray; the supply comes) ----
  ok(await page.evaluate(() => !BENCH.sim.RT.layout.regions.yew1 && !!BENCH.sim.RT.layout.regions.psu && !BENCH.sim.RT.S.jack.y1H), 'II: decade box left, supply came');
  await H.lead('h1v', null); await H.lead('h1c', null);
  /* a layout of its own (nodes 7–10, not the reference rectangle) */
  await H.focus('board'); await H.place('R4k7', 7, 8); await H.place('R1k', 8, 9); await H.place('R2k2', 9, 10); await H.lead('Lp', 7); await H.lead('Lm', 10);
  ok(await done(5), 'II.1 Fig. 5 built');
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LVC-', 2); await H.key('p:LON');
  await H.focus('hm1'); await H.key('h1:SW-', 2);
  for (const [a, b] of [[7, 8], [8, 9], [9, 10], [7, 10]]) { await H.lead('h1v', a); await H.lead('h1c', b); }
  ok(await done(10), `II.2 V1 V2 V3 E measured, II.3–6: ${JSON.stringify(await st())}`);
  // ---- Procedure III ----
  await H.focus('psu'); await H.key('p:LON');
  await H.focus('board'); for (const [a, b] of [[7, 8], [8, 9], [9, 10]]) await H.del(a, b);
  await H.lead('Lp', null); await H.lead('Lm', null);
  ok(await page.evaluate(() => !BENCH.sim.RT.layout.regions.hm1 && !!BENCH.sim.RT.layout.regions.hm2), 'III: Fluke left, GoldStar came');
  await H.place('R1k', 23, 30); await H.place('R4k7', 24, 31); await H.place('R2k2', 25, 32);
  for (const [a, b] of [[30, 31], [31, 32], [16, 17], [17, 18], [16, 23], [17, 24], [18, 25], [15, 16]]) await H.place('BR', a, b);
  await H.lead('Lp', 15); await H.lead('Lm', 32); ok(await done(11), 'III.1 Fig. 6 built');
  await H.focus('psu'); await H.key('p:LON');
  await H.focus('hm2'); await H.key('h2:SW+', 6);
  await H.focus('board'); await H.del(16, 23); await H.lead('h2v', 16); await H.lead('h2c', 23);
  ok(!!(await st()).i1, `III I1 = ${JSON.stringify(await shown('hm2'))}`);
  const move = async (back, a, b) => { await H.lead('h2v', null); await H.lead('h2c', null); await H.place('BR', back[0], back[1]); await H.del(a, b); await H.lead('h2v', a); await H.lead('h2c', b); };
  await move([16, 23], 17, 24); await move([17, 24], 18, 25); await move([18, 25], 15, 16);
  ok(await done(15), `III.2 I1 I2 I3 IT, III.3–5: ${JSON.stringify(await st())}`);
  // ---- Procedure IV ----
  await H.focus('psu'); await H.key('p:LON'); await H.focus('board');
  await H.lead('h2v', null); await H.lead('h2c', null); await H.lead('Lp', null); await H.lead('Lm', null);
  for (const [a, b] of [[23, 30], [24, 31], [25, 32], [30, 31], [31, 32], [16, 17], [17, 18], [16, 23], [17, 24], [18, 25]]) await H.del(a, b);
  await H.place('R220', 9, 16); await H.place('R470', 9, 10); await H.place('BR', 10, 17); await H.place('R10k', 16, 17); await H.place('R220', 16, 23); await H.place('BR', 23, 24); await H.place('R1k', 17, 24);
  await H.lead('Lp', 2); await H.lead('Lm', 23); await H.lead('h2v', 2); await H.lead('h2c', 9);
  ok(await done(16), 'IV.1 Fig. 7 built (GoldStar in series)');
  await H.focus('hm2'); await H.key('h2:SW+'); await H.focus('psu'); await H.key('p:LVC+', 5); await H.key('p:LON');
  ok(await done(19), `IV.2 ID = ${JSON.stringify(await shown('hm2'))}, IV.3–4`);
  const setBox = async (k, target) => { await H.focus('yew' + k); const d = await page.evaluate(k => BENCH.sim.RT.S['yew' + k].d.slice(), k);
    for (let j = 0; j < 6; j++) while (d[j] !== target[j]) { await H.key(`y${k}:D${j}${d[j] < target[j] ? '+' : '-'}`); d[j] += d[j] < target[j] ? 1 : -1; } };
  await setBox(1, [10, 0, 0, 0, 0, 0]); await setBox(2, [0, 4, 4, 0, 0, 0]); await setBox(3, [6, 0, 2, 0, 0, 0]);
  await H.focus('board'); await H.del(9, 16); await H.del(9, 10); await H.del(16, 17);
  await H.lead('y1H', 12); await H.lead('y1L', 9); await H.lead('y2L', 12); await H.lead('y2H', 10); await H.lead('y3H', 12); await H.lead('y3L', 16);
  ok(await done(21), `IV.5 Fig. 8, IY, IV.6: ${JSON.stringify(await st())}`);
  await page.screenshot({ path: `/tmp/ee205-exp1-${vp}.png` });
  /* wrong circuits do not pass: a box on the wrong corner */
  ok(await page.evaluate(() => { const RT = BENCH.sim.RT; const ok8 = RT.match('8').ok; return ok8; }), 'Fig. 8 matches as built');
  // ---- sheet ----
  const S = await st();
  const F = await page.evaluate(S => { const P = BENCH.sim.RT.PARTS; const f = {}; const r = (x, d) => (+x).toFixed(d);
    f.c1 = 'a'; f.c2 = 'b'; f.c3 = 'c'; f.cv1 = 330; f.cv2 = 6800; f.cv3 = 56000; f.cm1 = r(S.rRC1, 1); f.cm2 = r(S.rRC2, 1); f.cm3 = r(S.rRC3, 1);
    [['b4', 4, .5], ['b50', 50, .2], ['b700', 700, .05], ['b5k', 5000, .05], ['b30k', 30000, .1]].forEach(([k, v, t]) => { f[k] = r(S[k], 1); f[k + 't'] = (v * t / 100).toFixed(4); f[k + 'e'] = ((+f[k] - v) / v * 100).toFixed(3); });
    const cal = { v1: 47 / 7.9, v2: 10 / 7.9, v3: 22 / 7.9, vt: 10 }; ['v1', 'v2', 'v3', 'vt'].forEach(k => { f[k + 'm'] = r(S[k], 3); f[k + 'c'] = r(cal[k], 3); f[k + 'e'] = ((+f[k + 'm'] - +f[k + 'c']) / +f[k + 'c'] * 100).toFixed(3); });
    const ci = { i1: 10, i2: 10 / 4.7, i3: 10 / 2.2 }; ci.it = ci.i1 + ci.i2 + ci.i3; ['i1', 'i2', 'i3', 'it'].forEach(k => { f[k + 'm'] = r(S[k] * 1e3, 2); f[k + 'c'] = r(ci[k], 2); f[k + 'e'] = ((+f[k + 'm'] - +f[k + 'c']) / +f[k + 'c'] * 100).toFixed(3); });
    const Sm = 10690, ra = 470 * 220 / Sm, rb = 4700000 / Sm, rc = 2200000 / Sm, id = 15 / (ra + 1 / (1 / (rc + 220) + 1 / (rb + 1000))) * 1e3;
    f.idc = r(id, 2); f.idm = r(S.id * 1e3, 2); f.ra = r(ra, 2); f.rb = r(rb, 2); f.rc = r(rc, 2); f.iym = r(S.iy * 1e3, 2); f.iyc = r(id, 2); return f; }, S);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('input')); } document.getElementById('submit').click(); }, F);
  const res = await page.evaluate(() => document.querySelector('#result .result b').textContent + ' | ' + [...document.querySelectorAll('#result .bad')].map(e => e.textContent).join(' ; '));
  const m = res.match(/(\d+) \/ (\d+)/); ok(m && m[1] === m[2], 'sheet full marks: ' + res);
}
