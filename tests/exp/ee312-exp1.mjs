import { sit, bench } from '../lib.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp1', 'exam');
  const H = bench(page); H.touch = vp === 'phone';
  const rd = (k = 0) => page.evaluate(k => { const r = BENCH.sim.RT.meters()[k].r; return { val: r.val, ol: r.ol, shown: r.shown && r.shown.main.trim() }; }, k);
  const rd2 = () => rd(1);
  const done = async n => (await H.steps()).done >= n;
  await H.focus('dmm'); await H.key('m:PWR'); await H.key('m:DIODE');
  ok(await done(1), 'A1 DMM on diode test');
  ok(await done(2) && (await rd()).shown === 'OVL.D', 'A2 open-circuit reading OVL.D');
  // Part A as in the lab: the diode's legs straight into HI / COM, tap to flip
  await H.jack('D4001'); await H.key('m:JDFLIP');
  ok(await done(3) && (await rd()).shown === 'OVL.D', 'A3 1N4001 in the jacks, cathode in HI: OVL.D');
  await H.key('m:JDFLIP');
  const vf = {}; vf.si = (await rd()).val; ok(await done(4) && vf.si > 0.5 && vf.si < 0.6, `A4 anode in HI: forward ${vf.si.toFixed(3)} V`);
  for (const [t, k] of [['Z4733', 'z'], ['LED', 'led'], ['GE', 'ge']]) { await H.key('m:JDOUT'); await H.jack(t); vf[k] = (await rd()).val;
    if (t === 'LED') ok(await page.evaluate(() => !!document.querySelector('#bench [data-k="m:JDFLIP"] circle[opacity]')), 'the LED glows faintly on the diode test'); }
  ok(vf.z > 0.6 && vf.z < 0.75 && vf.led > 1.6 && vf.led < 2.0 && vf.ge > 0.18 && vf.ge < 0.32, `A5 Zener ${vf.z.toFixed(3)}, LED ${vf.led.toFixed(3)}, Ge ${vf.ge.toFixed(3)} V`);
  ok(await done(5), 'A5 all four diodes tested');
  await H.key('m:JDOUT'); ok(await done(6) && await page.evaluate(() => !BENCH.sim.RT.S.dmm.jd && !BENCH.sim.RT.S.parts.length), 'A6 diode back in the box, jacks free');
  // ---- Procedure B: DMM 1 on RS, DMM 2 on the diode (Fig. 1.3) ----
  await H.focus('board'); await H.place('R100', 14, 15); await H.lead('Lp', 14); await H.lead('Lm', 22); await H.lead('m2h', 15); await H.lead('m2l', 22);
  ok(await done(7), 'B1 Fig. 1.3a built (DMM 2 across the open circuit)');
  await H.focus('dmm2'); await H.key('m2:PWR'); await H.key('m2:DCV'); ok(await done(8), 'B2 DMM 2 on DCV');
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LI-', 45); await H.key('p:LVC-', 7); await H.key('p:LON');
  ok(await done(9), 'B3 5 V / 0.05 A, dc ON');
  const voc = (await rd2()).val; ok(await done(10) && voc > 4.99, `B4 VOC = ${voc} (DMM 2)`);
  await H.focus('board'); await H.place('D4001', 15, 22); await H.flip(15, 22);
  const vrev = (await rd2()).val; ok(await done(11) && vrev > 4.99, `B5 Vrev = ${vrev}`);
  await H.focus('psu'); await H.key('p:LON'); await H.focus('board'); await H.flip(15, 22);
  ok(await done(12), 'B6 dc OFF, diode flipped');
  await H.focus('psu'); await H.key('p:LON');
  await H.focus('board'); await H.lead('mh', 14); await H.lead('ml', 15); await H.focus('dmm'); await H.key('m:DCV'); await H.focus('psu');
  const adjust = async target => { for (let i = 0; i < 400; i++) { const r = (await rd()).val; if (Math.abs(r - target) <= 0.004) return r; const big = Math.abs(r - target) > 0.6;
      await H.key(big ? (r < target ? 'p:LVC+' : 'p:LVC-') : (r < target ? 'p:LVF+' : 'p:LVF-')); } return null; };
  const vd = {};
  for (const [t, k, n] of [[0.1, 1, 13], [1, 10, 14], [2, 20, 15]]) {
    const vrs = await adjust(t); vd[k] = (await rd2()).val;
    ok(vrs != null && await done(n), `B${n - 6} DMM 1: VRS = ${vrs && vrs.toFixed(4)} V → DMM 2: VD = ${vd[k].toFixed(3)} V`);
  }
  const both = await page.evaluate(() => { const M = BENCH.sim.RT.meters(); return { a: M[0].r.val, b: M[1].r.val, vdd: BENCH.sim.RT.S.psu.u[0].v }; });
  ok(Math.abs(both.a + both.b - both.vdd) < 0.02, `both meters read together: VRS ${both.a.toFixed(3)} + VD ${both.b.toFixed(3)} ≈ VDD ${both.vdd.toFixed(2)} V`);
  await H.focus('board');
  await H.place('BR', 15, 16); await H.place('BR', 22, 23); await H.place('R100', 16, 23);
  const vdl = (await rd2()).val; ok(await done(16) && vdl < vd[20], `B10 VD′ with RL = ${vdl.toFixed(3)} V`);
  await page.screenshot({ path: '/tmp/exp1-' + vp + '-board.png' }); await H.focus('psu'); await H.key('p:LON'); ok(await done(17), 'B11 supply off — all steps done');
  // ---- sheet ----
  const r3 = x => x.toFixed(3);
  const F = { a_open: 'ovl', a_rev: 'ovl', a_si: r3(vf.si), a_z: r3(vf.z), a_led: r3(vf.led), a_ge: r3(vf.ge), b_voc: r3(voc), b_vrev: r3(vrev),
    b_vd1: r3(vd[1]), b_vd10: r3(vd[10]), b_vd20: r3(vd[20]), b_vdn: r3(vd[20]), b_vdl: r3(vdl), q1: 'b', q2: 'a', q4: 'a', q5n: '3', q5b: '2', q5r: '49.5', q5c: 'a' };
  const n = k => +F[k];
  F.b_d1 = r3(n('b_vd10') - n('b_vd1')); F.b_d2 = r3(n('b_vd20') - n('b_vd10')); F.b_dvl = r3(n('b_vdl') - n('b_vdn')); F.b_pct = ((n('b_vdl') - n('b_vdn')) / n('b_vdn') * 100).toFixed(2);
  F.q3a = F.b_d1; F.q3b = F.b_d2; F.q3c = r3(n('b_vd10') + n('b_d1') + n('b_d2'));
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
  const tr = await page.evaluate(() => STATS.trace.join());
  ok(['exp/ee312/exp1/start/exam', 'exp/ee312/exp1/done', 'exp/ee312/exp1/graded/100', 'time/ee312/exp1/'].every(p => tr.includes(p)), 'usage events: start, done, graded/100, time bucket');
}
