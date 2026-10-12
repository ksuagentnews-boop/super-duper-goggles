import { sit, bench } from '../lib.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp1', 'manual');
  const H = bench(page); H.touch = vp === 'phone';
  const rd = () => page.evaluate(() => { const r = BENCH.sim.RT.dmm(); return { val: r.val, ol: r.ol, shown: r.shown && r.shown.main.trim() }; });
  const done = async n => (await H.steps()).done >= n;
  await H.focus('dmm'); await H.key('m:PWR'); await H.key('m:DIODE');
  ok(await done(1), 'A1 DMM on diode test');
  ok(await done(2) && (await rd()).shown === 'OVL.D', 'A2 open-circuit reading OVL.D');
  await H.focus('board'); await H.place('D4001', 0, 1); await H.lead('mh', 1); await H.lead('ml', 0);
  ok(await done(3) && (await rd()).shown === 'OVL.D', 'A3 reverse-biased 1N4001 reads OVL.D');
  await H.lead('mh', 0); await H.lead('ml', 1);
  const vf = {}; vf.si = (await rd()).val; ok(await done(4) && vf.si > 0.5 && vf.si < 0.6, `A4 1N4001 forward ${vf.si.toFixed(3)} V`);
  for (const [t, k] of [['Z4733', 'z'], ['LED', 'led'], ['GE', 'ge']]) { await H.del(0, 1); await H.place(t, 0, 1); vf[k] = (await rd()).val; }
  ok(vf.z > 0.6 && vf.z < 0.75 && vf.led > 1.6 && vf.led < 2.0 && vf.ge > 0.18 && vf.ge < 0.32, `A5 Zener ${vf.z.toFixed(3)}, LED ${vf.led.toFixed(3)}, Ge ${vf.ge.toFixed(3)} V`);
  ok(await done(5), 'A5 all four diodes tested');
  ok(await page.evaluate(() => BENCH.sim.RT.S.parts.find(p => p.type === 'GE') != null), 'Ge diode on the panel');
  // ---- Procedure B ----
  await H.del(0, 1); await H.place('R100', 14, 15); await H.lead('Lp', 14); await H.lead('Lm', 22); await H.lead('mh', 15); await H.lead('ml', 22);
  ok(await done(6), 'B1 Fig. 1.3a built');
  await H.focus('dmm'); await H.key('m:DCV'); ok(await done(7), 'B2 DMM on DCV');
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LI-', 45); await H.key('p:LVC-', 7); await H.key('p:LON');
  ok(await done(8), 'B3 5 V / 0.05 A, dc ON');
  const voc = (await rd()).val; ok(await done(9) && voc > 4.99, `B4 VOC = ${voc}`);
  await H.focus('board'); await H.place('D4001', 15, 22); await H.flip(15, 22);
  const vrev = (await rd()).val; ok(await done(10) && vrev > 4.99, `B5 Vrev = ${vrev}`);
  await H.focus('psu'); await H.key('p:LON'); await H.focus('board'); await H.flip(15, 22);
  ok(await done(11), 'B6 dc OFF, diode flipped');
  await H.focus('psu'); await H.key('p:LON');
  const adjust = async target => { await H.focus('board'); await H.lead('mh', 14); await H.lead('ml', 15); await H.focus('psu');
    for (let i = 0; i < 400; i++) { const r = (await rd()).val; if (Math.abs(r - target) <= 0.004) return r; const big = Math.abs(r - target) > 0.6;
      await H.key(big ? (r < target ? 'p:LVC+' : 'p:LVC-') : (r < target ? 'p:LVF+' : 'p:LVF-')); } return null; };
  const vd = {};
  for (const [t, k, n] of [[0.1, 1, 12], [1, 10, 13], [2, 20, 14]]) {
    const vrs = await adjust(t); await H.focus('board'); await H.lead('mh', 15); await H.lead('ml', 22); vd[k] = (await rd()).val;
    ok(vrs != null && await done(n), `B${n - 5} VRS = ${vrs && vrs.toFixed(4)} V → VD = ${vd[k].toFixed(3)} V`);
  }
  await H.place('BR', 15, 16); await H.place('BR', 22, 23); await H.place('R100', 16, 23);
  const vdl = (await rd()).val; ok(await done(15) && vdl < vd[20], `B10 VD′ with RL = ${vdl.toFixed(3)} V`);
  await page.screenshot({ path: '/tmp/exp1-' + vp + '-board.png' }); await H.focus('psu'); await H.key('p:LON'); ok(await done(16), 'B11 supply off — all steps done');
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
  ok(['exp/ee312/exp1/start/manual', 'exp/ee312/exp1/done', 'exp/ee312/exp1/graded/100', 'time/ee312/exp1/'].every(p => tr.includes(p)), 'usage events: start, done, graded/100, time bucket');
}
