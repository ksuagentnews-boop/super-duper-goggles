import { sit, bench } from '../lib.mjs';
const REV = [25, 20, 15, 10, 7, 5, 4, 3], FWD = [0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.75, 1.7, 10.7, 20.7];
const key = (t, b, v) => `${t}_${b}_${String(v).replace('.', 'p')}`;
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp2', 'exam');
  const H = bench(page); H.touch = vp === 'phone';
  const rd = (k = 0) => page.evaluate(k => BENCH.sim.RT.meters()[k].r.val, k);
  const done = async n => (await H.steps()).done >= n;
  const setV = async target => { await H.focus('psu'); for (let i = 0; i < 300; i++) { const v = await page.evaluate(() => BENCH.sim.RT.S.psu.u[0].v); const d = +(target - v).toFixed(2); if (Math.abs(d) < 0.005) return;
    await H.key(Math.abs(d) >= 1 ? (d > 0 ? 'p:LVC+' : 'p:LVC-') : (d > 0 ? 'p:LVF+' : 'p:LVF-')); } };
  const F = {};
  /* two meters as in Fig. 2.3: DMM 1 on RS, DMM 2 on the diode — read both, no lead moves */
  const measure = async (t, b, v) => { await setV(v); F[key(t, b, v) + '_vd'] = (await rd(1)).toFixed(3); F[key(t, b, v) + '_vrs'] = (await rd(0)).toFixed(3); };
  /* Fig. 2.3a built in a layout of its own (not the reference one): RS 14–15, the 1N4001 anode 15 / cathode 22,
     DC − on RS (14), DC + on the cathode (22); DMM 1 on RS (+ on 14), DMM 2 on the diode (+ on the anode) */
  await H.focus('board'); await H.place('R1k', 14, 15); await H.place('D4001', 15, 22); await H.lead('Lm', 14); await H.lead('Lp', 22);
  await H.lead('mh', 14); await H.lead('ml', 15); await H.lead('m2h', 15); await H.lead('m2l', 22);
  ok(await done(1), 'A1 Fig. 2.3a with the 1N4001 (both meters as drawn), in a layout of its own');
  await H.focus('psu'); await H.key('p:PWR'); await setV(25); await H.key('p:LON');
  ok(await done(2), 'A2 VBB = 25 V, 0.05 A, dc ON');
  await H.focus('dmm'); await H.key('m:PWR'); await H.key('m:DCV'); await H.focus('dmm2'); await H.key('m2:PWR'); await H.key('m2:DCV');
  await measure('D4001', 'R', 25); ok(await done(3), `A3 rectifier @25 V: VD ${F[key('D4001', 'R', 25) + '_vd']}, VRS ${F[key('D4001', 'R', 25) + '_vrs']}`);
  /* the manual's order, as the sub-steps take it: the Zener at 25 V (step 4), then the other VBB values with the Zener, the rectifier back and its rows (step 5) */
  await H.focus('board'); await H.del(15, 22); await H.place('Z4733', 15, 22); await measure('Z4733', 'R', 25); ok(await done(4), 'A4 Zener @25 V');
  for (const v of REV.slice(1)) await measure('Z4733', 'R', v);
  await H.focus('board'); await H.del(15, 22); await H.place('D4001', 15, 22);
  for (const v of [...REV.slice(1)].reverse()) await measure('D4001', 'R', v);
  ok(await done(5), `A5 all reverse rows: Zener @25 V VD ${F[key('Z4733', 'R', 25) + '_vd']}, ID ${F[key('Z4733', 'R', 25) + '_vrs']} mA`);
  await H.focus('psu'); await H.key('p:LON'); ok(await done(6), 'A6 dc OFF');
  await H.focus('board'); await H.lead('Lp', 14); await H.lead('Lm', 22); ok(await done(7), 'B1 supply swapped → Fig. 2.3b (rectifier)');
  await setV(0.3); ok(await done(8), 'B2 VFF = 0.3 V'); await H.key('p:LON');
  await measure('D4001', 'F', 0.3); ok(await done(9), `B3 1N4001 @0.3 V: VD ${F[key('D4001', 'F', 0.3) + '_vd']}`);
  await H.focus('board'); await H.del(15, 22); await H.place('Z4733', 15, 22);
  for (const v of FWD) await measure('Z4733', 'F', v);
  await H.focus('board'); await H.del(15, 22); await H.place('D4001', 15, 22);
  for (const v of [...FWD.slice(1)].reverse()) await measure('D4001', 'F', v);
  ok(await done(10), `B4 all forward rows: 1N4001 @10.7 V VD ${F[key('D4001', 'F', 10.7) + '_vd']}, ID ${F[key('D4001', 'F', 10.7) + '_vrs']} mA`);
  await H.focus('psu'); await H.key('p:LON'); ok(await done(11), 'B5 off — all steps done');
  const n = k => Math.abs(+F[k]);
  const V1 = n(key('D4001', 'F', 1.7) + '_vd'), I1 = n(key('D4001', 'F', 1.7) + '_vrs') * 1e-3, V2 = n(key('D4001', 'F', 10.7) + '_vd'), I2 = n(key('D4001', 'F', 10.7) + '_vrs') * 1e-3;
  const nn = (V2 - V1) / (0.026 * Math.log(I2 / I1)), Is = I2 / Math.exp(V2 / (nn * 0.026)) * 1e9;
  const z = x => key('Z4733', 'R', x); const rz = (n(z(20) + '_vd') - n(z(15) + '_vd')) / ((n(z(20) + '_vrs') - n(z(15) + '_vrs')) * 1e-3), vz0 = n(z(20) + '_vd') - n(z(20) + '_vrs') * 1e-3 * rz;
  const iz = (25 - vz0) / (1000 + rz) * 1e3;
  Object.assign(F, { q1c: '0.55', q2n: nn.toFixed(3), q2is: Is.toPrecision(4), q3r: rz.toFixed(2), q3v: vz0.toFixed(3), q4i: iz.toFixed(3), q4v: (vz0 + iz * 1e-3 * rz).toFixed(3), q5v: V2.toFixed(3), q5i: (10.7 - V2).toFixed(2), q5c: 'a' });
  console.log(`    n = ${nn.toFixed(3)}, IS = ${Is.toPrecision(3)} nA, rZ = ${rz.toFixed(2)} Ω, VZ0 = ${vz0.toFixed(3)} V`);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('plotBtn').click(); document.getElementById('submit').click(); }, F);
  ok(await page.$eval('#ivplot', e => e.querySelectorAll('polyline').length === 2), 'PLQ 1 plot drawn from the table');
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
