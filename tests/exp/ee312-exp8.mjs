import { sit, bench } from '../lib.mjs';
import { pcDriver } from '../pc.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp8', 'manual');
  const H = bench(page); const P = pcDriver(page, vp === 'phone');
  const done = async n => (await H.steps()).done >= n;
  const V = () => P.view(-3, -6, vp === 'phone' ? 0.3 : 0.8);
  await P.act('new'); ok(await done(1), 'A1 New Schematic'); await V();
  // V2 (10,-2)…(10,2); R1 (6,-2)…(6,2); M1 at (4,2): D (6,2) G (4,4) S (6,6) B (7,4); V1 (0,4)…(0,8)
  await P.place('V', 0, 4); await P.place('V', 10, -2); await P.place('R', 6, -2); await P.act('R'); await P.place('NM', 4, 2);
  for (const [x, y] of [[10, 2], [6, 6], [0, 8]]) await P.place('GND', x, y); await P.act('GND');
  await P.value('R1', '{RD}'); await P.mos('M1', 'N_1u'); await P.source('V2', 'DC', '5');
  ok(await done(2), 'A2 parts: R1 {RD}, M1 N_1u, sources, GND');
  await P.wire([6, -2], [10, -2], [7, 4], [7, 6], [7, 6], [6, 6], [0, 4], [4, 4]); await P.act('wire');
  await P.label('in', 0, 4); await P.label('out', 6, 2); ok(await done(3), 'A3 wires and labels in / out');
  await P.dir('.lib mosfet1u.lib\n.step param RD 10k 110k 20k', 14, -1); ok(await done(4), 'A4 .lib and .step');
  await P.source('V1', 'PULSE', [0, 5, 0, '0.1n', '0.1n', '10n', '20n', 3]); ok(await done(5), 'A5 PULSE');
  await P.dc('V1', '0', '5', '5m'); await P.at(14, 4); ok(await done(6), 'A6 .dc V1 0 5 5m');
  await P.run(); ok(await done(7), 'A7 run (VTC, 6 values of RD)'); await V();
  await P.probe(6, 2); ok(await done(8), 'A8–9 V(out) VTC');
  const vol = await page.evaluate(() => { const RT = BENCH.sim.RT; return RT.evalOn(RT.S.res, 'V(out)').map(a => a[a.length - 1]); });
  ok(vol[0] > vol[5], 'VOL falls as RD rises: ' + vol.map(x => x.toFixed(3)).join(' '));
  await P.tran('60n', '0', '0.01n'); ok(await done(9), 'A9 .tran 0 60n 0 0.01n');
  await P.run(); ok(await done(10), 'A10 run'); await V(); await P.probe(6, 2); await P.probe(0, 4); ok(await done(11), 'A11 V(out), V(in)');
  await P.zoomW(0.15, 0.2); ok(await done(12), 'A12 zoom'); await P.act('save'); ok(await done(13), 'A13 saved');
  await page.screenshot({ path: '/tmp/exp8-' + vp + '-A.png' });
  // ---- B: CMOS inverter
  await P.act('new'); ok(await done(14), 'B1 New Schematic'); await V();
  await P.place('V', 0, 2); await P.place('V', 10, -4); await P.place('NM', 4, 0); await P.place('PM', 4, -4);
  for (const [x, y] of [[0, 6], [10, 0], [6, 4]]) await P.place('GND', x, y); await P.act('GND');
  await P.wire([6, -4], [10, -4], [7, -2], [7, -4], [7, 2], [7, 4], [7, 4], [6, 4], [4, -2], [2, -2], [2, -2], [2, 2], [2, 2], [4, 2], [0, 2], [2, 2]); await P.act('wire');
  await P.mos('M1', 'N_1u'); await P.mos('M2', 'P_1u'); await P.source('V1', 'PULSE', [0, 5, 0, '0.1n', '0.1n', '10n', '20n', 3]); await P.source('V2', 'DC', '5');
  await P.label('in', 0, 2); await P.label('out', 6, 0); ok(await done(15), 'B2–4 Fig. 8.6');
  await P.dir('.lib mosfet1u.lib', 14, -2); await P.dc('V1', '0', '5', '0.005'); await P.at(14, 3); await P.run(); await V(); await P.probe(6, 0); ok(await done(16), 'B5–8 .dc run, VTC');
  await P.tran('60n', '0', '0.01n'); await P.run(); await V(); await P.probe(6, 0); await P.probe(0, 2); ok(await done(17), 'B9–12 .tran run, V(out), V(in)');
  await P.zoomW(0.16, 0.19); ok(await done(18), 'B13 zoom');
  const tplh = await page.evaluate(() => { const RT = BENCH.sim.RT, R = RT.S.res; const vi = RT.evalOn(R, 'V(in)')[0], vo = RT.evalOn(R, 'V(out)')[0], xs = R.runs[0].xs;
    const cross = (v, up, t0) => { for (let k = 1; k < xs.length; k++) { if (xs[k] < t0) continue; if (up ? (v[k - 1] < 2.5 && v[k] >= 2.5) : (v[k - 1] > 2.5 && v[k] <= 2.5)) return xs[k - 1] + (2.5 - v[k - 1]) / (v[k] - v[k - 1]) * (xs[k] - xs[k - 1]); } return NaN; };
    const ti = cross(vi, false, 5e-9); return (cross(vo, true, ti) - ti) * 1e12; });
  await page.screenshot({ path: '/tmp/exp8-' + vp + '-B.png' });
  await P.act('save'); ok(await done(19), `B14 saved — all steps done (tPLH ≈ ${tplh.toFixed(1)} ps)`);
  const F = { a_slope: 'inc', a_vol: 'dec', a_gate: 'not', a_rd: '110', b_gate: 'not', b_tplh: tplh.toFixed(1), q1: 'a', q2: 'a' };
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
