import { sit, bench } from '../lib.mjs';
import { pcDriver } from '../pc.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp6', 'exam');
  const H = bench(page); const P = pcDriver(page, vp === 'phone');
  const done = async n => (await H.steps()).done >= n;
  await P.act('new'); ok(await done(1), 'A1 New Schematic');
  await P.view(-3, -6, vp === 'phone' ? 0.25 : 0.7);
  // primary: V1 (0,0)-(0,4), R1 (0,0)→(4,0), L1 (4,0)-(4,4); secondary L2 (8,0)-(8,4), R2 (8,0)→(12,0)
  await P.place('V', 0, 0); await P.place('R', 0, 0, 3); await P.place('R', 8, 0); await P.act('R');
  await P.place('L', 4, 0); await P.place('L', 8, 0); await P.act('L');
  // diodes: D1 S1→P, D2 0→S2, D3 S2→P, D4 0→S1 ; S1 = (12,0), S2 = (20,0), P = (12,4)…(20,4)
  await P.place('D', 12, 0); await P.place('D', 20, -4); await P.place('D', 20, 0); await P.place('D', 12, -4); await P.act('D');
  await P.place('R', 32, 4); await P.act('R');
  // R2 was placed vertical at (8,0): rotate it to run (8,0)→(12,0)? → place it rotated instead
  await page.evaluate(() => { const S = BENCH.sim.RT.S; const r2 = S.comps.find(c => c.name === 'R2'); S.comps = S.comps.filter(c => c !== r2); S.cnt.R = 1; BENCH.sim.render(); });
  await P.place('R', 8, 0, 3); await P.act('R'); await page.evaluate(() => { const S = BENCH.sim.RT.S; const r = S.comps.filter(c => c.type === 'R'); r.find(c => c.x === 32).name = 'R3'; r.find(c => c.x === 8).name = 'R2'; S.cnt.R = 3; BENCH.sim.render(); });
  await P.dir('K1 L1 L2 1', 25, -3);
  ok(await done(2), 'A2 parts (no C) + K1 L1 L2 1');
  for (const [x, y] of [[0, 4], [4, 4], [16, -4], [32, 8]]) { await P.place('GND', x, y); } await P.act('GND');
  await P.wire([8, 4], [8, 6], [8, 6], [22, 6], [22, 6], [22, 0], [22, 0], [20, 0], [12, -4], [20, -4], [12, 4], [20, 4], [20, 4], [32, 4]); await P.act('wire');
  await P.label('S1', 12, 0); await P.label('S2', 20, 0); await P.label('out', 32, 4);
  ok(await done(3), 'A3 GND, wires, labels');
  await P.value('R1', '20'); await P.value('R2', '2'); await P.value('R3', '4.7k'); await P.value('L1', '400m'); await P.value('L2', '1m');
  for (const d of ['D1', 'D2', 'D3', 'D4']) await P.diode(d, '1N4148');
  ok(await done(4), 'A4 values');
  await P.source('V1', 'SINE', [0, 311, 60, 0, 0, 0, 12]); ok(await done(5), 'A5 SINE(0 311 60 0 0 0 12)');
  await P.tran('0.2', '0', '0.2m'); await P.at(33, -3); ok(await done(6), 'A6 .tran 0 0.2 0 0.2m');
  await P.run(); ok(await done(7), 'A7 run (matches the reference circuit)');
  await P.view(-3, -6, vp === 'phone' ? 0.25 : 0.7);
  await P.probe(32, 4); ok(await done(8), 'A8 V(out)');
  await P.probe2([12, 0], [20, 0]); const vsm = await P.peak('V(s1,s2)'); ok(await done(9), `A9 V(s1,s2): VSM = ${vsm.toFixed(2)} V`);
  await P.probe2([12, 0], [32, 4]); const piv = -(await P.peak('V(s1,out)', 0, true)); ok(await done(10), `A10 PIV = ${piv.toFixed(2)} V`);
  await P.place('C', 28, 4); await P.act('C'); await P.place('GND', 28, 8); await P.act('GND'); await P.value('C1', '470u'); await P.run();
  await P.value('C1', '10u'); await P.run(); ok(await done(11), 'A11 C1 470µ and 10µ');
  await P.value('C1', '470u'); await P.run(); await P.view(-3, -6, vp === 'phone' ? 0.25 : 0.7); await P.probeI('D1'); const surge = await P.peak('I(D1)'); ok(await done(12), `A12 I(D1) surge = ${surge.toFixed(3)} A`);
  await P.zoomW(0.55, 0.98); if (process.env.SHOT) { console.log(await page.evaluate(() => JSON.stringify([BENCH.sim.RT.S.zoom, BENCH.sim.RT.S.zooms, BENCH.sim.RT.S._ax, document.getElementById('pcWsvg').getBoundingClientRect()]))); await page.screenshot({ path: '/tmp/exp6-z.png' }); } await P.avgOf('I(D1)'); const av = await P.avgVal(); ok(await done(13), `A13 zoom + average I(D1) = ${(av.avg * 1e3).toFixed(2)} mA`);
  await P.fitW(); ok(await done(14), 'A14 Zoom Full');
  await P.delTrace('I(D1)'); await P.delTrace('V(s1,out)'); ok(await done(15), 'A15 traces deleted');
  await P.value('R3', '270'); await P.run(); ok(await done(16), 'A16 load 270 Ω');
  // ---- B: regulator: P line now ends at C1 (28,4); R4 (28,4)→(32,4)… re-route: delete wire (20,4)-(32,4), add wires and R4
  await P.view(-3, -6, vp === 'phone' ? 0.25 : 0.7);
  await page.evaluate(() => { const S = BENCH.sim.RT.S; S.wires = S.wires.filter(w => !(w.y1 === 4 && w.y2 === 4 && Math.min(w.x1, w.x2) === 20)); BENCH.sim.render(); });
  await P.wire([20, 4], [28, 4]); await P.act('wire');
  await P.place('R', 28, 4, 3); await P.act('R'); await P.value('R4', '100'); await P.wire([32, 4], [36, 4]); await P.act('wire');
  await P.place('D', 36, 8, 2); await P.act('D'); await P.place('GND', 36, 8); await P.act('GND'); await P.diode('D5', '1N750');
  await page.evaluate(() => { const S = BENCH.sim.RT.S; S.labels.find(l => l.name === 'out').x = 32; BENCH.sim.render(); });
  await P.value('R3', '4.7k'); await P.run(); const v47 = await P.peak('V(out)', 0.1); ok(await done(17), `B1 regulator 4.7k: Vout ≈ ${v47.toFixed(3)} V`);
  await P.value('R3', '270'); await P.run(); const v270 = await P.peak('V(out)', 0.1); ok(await done(18), `B2 270 Ω: Vout ≈ ${v270.toFixed(3)} V`);
  await P.act('save'); ok(await done(19), 'B3 saved');
  await page.screenshot({ path: '/tmp/exp6-' + vp + '-B.png' });
  // ---- C: comparator
  await P.act('new'); ok(await done(20), 'C1 New Schematic'); await P.view(-2, -7, vp === 'phone' ? 0.3 : 0.8);
  await P.place('OA:OP747', 10, 0); await P.place('V', 12, -1, 2); await P.place('V', 12, 7, 2); await P.place('V', 6, 0);
  await P.place('R', 14, 1, 3); await P.act('R');
  await P.place('D', 18, 1); await P.place('D', 18, 5); await P.place('D', 22, 5, 2); await P.place('D', 22, 9, 2); await P.act('D');
  for (const [x, y] of [[10, 2], [6, 4], [12, -5], [12, 7], [18, 9], [22, 9]]) await P.place('GND', x, y); await P.act('GND');
  await P.wire([6, 0], [10, 0], [18, 1], [22, 1]); await P.act('wire');
  await P.label('in', 6, 0); await P.label('IC_out', 14, 1); await P.label('out', 22, 1);
  await P.value('R1', '1000'); for (const d of ['D1', 'D2', 'D3', 'D4']) await P.diode(d, '1N4148');
  await P.source('V1', 'DC', '15'); await P.source('V2', 'DC', '15');
  ok(await done(21), 'C2–3 Fig. 6.4 parts and labels');
  await P.source('V3', 'SINE', [0, 1, 1000, 0, 0, 0, 3]); await P.tran('3m', '0', '3u'); await P.at(26, -4); ok(await done(22), 'C4–5 Vin and .tran');
  await P.run(); await P.view(-2, -7, vp === 'phone' ? 0.3 : 0.8); await P.probe(6, 0); await P.probe(14, 1); await P.probe(22, 1);
  const cmax = await P.peak('V(out)'), cmin = await P.peak('V(out)', 0, true); ok(await done(23), `C6 run + traces · out ${cmax.toFixed(2)} / ${cmin.toFixed(2)} V`);
  await P.probeI('D2'); await P.act('rot'); await P.act('rot'); await P.diode('D2', '1N750'); await P.run();
  const zmax = await P.peak('V(out)'), zmin = await P.peak('V(out)', 0, true); ok(await done(24), `C7–8 D2 flipped 1N750 · out ${zmax.toFixed(2)} / ${zmin.toFixed(2)} V`);
  await P.view(-2, -7, vp === 'phone' ? 0.3 : 0.8); await P.probeI('R1'); const imax = await P.peak('I(R1)'); ok(await done(25), `C9 I(R1) max = ${(imax * 1e3).toFixed(2)} mA`);
  await page.screenshot({ path: '/tmp/exp6-' + vp + '-C.png' });
  await P.act('save'); ok(await done(26), 'C10 saved — all steps done');
  const F = { a_vsm: vsm.toFixed(2), a_piv: piv.toFixed(2), a_pivok: 'y', a_rip: 'a', a_surge: surge.toFixed(3), a_surgeok: 'y', a_iavg: (av.avg * 1e3).toFixed(2), a_iavgok: 'y', a_270: 'a',
    b_v47: v47.toFixed(3), b_v270: v270.toFixed(3), c_max: cmax.toFixed(2), c_min: cmin.toFixed(2), c_zmax: zmax.toFixed(2), c_zmin: zmin.toFixed(2), c_cmp: 'a', c_imax: (imax * 1e3).toFixed(2), c_iok: 'y', q1a: 'a', q1b: 'a' };
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
