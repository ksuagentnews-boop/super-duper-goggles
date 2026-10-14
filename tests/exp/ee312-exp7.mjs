import { sit, bench } from '../lib.mjs';
const VDS = [0.05, 0.1, 0.15, 0.3, 0.45, 0.75, 1.5, 3];
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp7', 'exam');
  const H = bench(page); H.touch = vp === 'phone';
  const done = async n => (await H.steps()).done >= n;
  const rd = (k = 0) => page.evaluate(k => BENCH.sim.RT.meters()[k].r.val, k);
  const U = u => page.evaluate(u => BENCH.sim.RT.S.psu.u[u].v, u);
  /* set a unit's voltage with COARSE / FINE presses */
  const setV = async (side, target) => { const u = side === 'L' ? 0 : 1; let v = await U(u); const dc = Math.trunc(target - v); if (dc) await H.key(`p:${side}VC${dc > 0 ? '+' : '-'}`, Math.abs(dc));
    v = await U(u); const df = Math.round((target - v) * 100); if (df) await H.key(`p:${side}VF${df > 0 ? '+' : '-'}`, Math.abs(df)); return U(u); };
  /* adjust VDD (left unit) until the DMM reads the target */
  /* VDD (left unit) until the DMM reads the target: the reading rises with VDD, so bracket then bisect on the 10 mV grid */
  let SK = 0;   // which meter seek() reads
  const seek = async target => { const at = async v => { await setV('L', v / 100); return rd(SK); };
    let lo = Math.round((await U(0)) * 100), r = await rd(SK);
    if (r > target) { let hi = lo; lo = 0; while (hi - lo > 1) { const m = (lo + hi) >> 1; if ((await at(m)) > target) hi = m; else lo = m; } const rl = await at(lo), rh = await at(hi); return Math.abs(rl - target) < Math.abs(rh - target) ? at(lo) : rh; }
    let hi = lo; let st = 25; while ((r = await at(hi)) < target && hi < 3000) { lo = hi; hi += st; st *= 2; } hi = Math.min(hi, 3000);
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if ((await at(m)) > target) hi = m; else lo = m; }
    const rl = await at(lo), rh = await at(hi); return Math.abs(rl - target) < Math.abs(rh - target) ? at(lo) : rh; };
  // ---- A: IRF620 at nodes 15 (G) 16 (D) 17 (S)
  await H.focus('board'); await H.placeIC('IRF620', 15, [[0, 0], [1, 0], [2, 0]]);
  await H.place('BR', 15, 16); await H.place('R1k', 16, 23); await H.lead('Lp', 23); await H.lead('Lm', 17); await H.lead('mh', 23); await H.lead('ml', 16); await H.lead('m2h', 15); await H.lead('m2l', 17);
  ok(await done(1), 'A1 Fig. 7.1a');
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LI-', 40); await setV('L', 0); await H.key('p:LON'); ok(await done(2), 'A2 0.100 A limit, dc ON');
  await H.focus('dmm'); await H.key('m:PWR'); await H.key('m:DCV'); await H.focus('dmm2'); await H.key('m2:PWR'); await H.key('m2:DCV'); await H.focus('psu');
  const vrd = await seek(0.25); ok(await done(3), `A3 VRD = ${vrd}`);
  const vth = await rd(1); ok(await done(4), `A4 VGS(TH) = ${vth} (DMM 2)`);
  await H.focus('psu'); await H.key('p:LON'); ok(await done(5), 'A5 dc off');
  // ---- B
  await H.focus('board'); await H.del(15, 16); await H.lead('Rp', 15); await H.lead('Rm', 17); await H.lead('m2h', 16); await H.lead('m2l', 17); ok(await done(6), 'B1 Fig. 7.1b, DMM 2 on D–S'); SK = 1;
  const tab = {};
  for (const k of [1, 2, 3]) {
    await H.focus('psu'); await setV('R', +(vth + 0.15 * k).toFixed(2)); if (k === 1) { await H.key('p:RON'); await setV('L', 0); await H.key('p:LON'); ok(await done(7), 'B2 VGS1 set'); }
    tab[k] = [];
    for (const t of VDS) { await H.focus('psu'); const vds = await seek(t); tab[k].push(await rd(0)); if (Math.abs(vds - t) > 0.004) console.log('   miss', k, t, vds); }
    ok(await done(7 + k), `B curve ${k}: ${tab[k].map(x => x.toFixed(3)).join(' ')}`);
  }
  await H.focus('psu'); await H.key('p:PWR'); ok(await done(11), 'B6 supply off');
  // ---- C
  await H.focus('board'); await H.del(16, 23); await H.place('R270', 16, 23);
  await H.focus('psu'); await H.key('p:PWR'); await setV('L', 10); await setV('R', +(vth + 0.3).toFixed(2)); ok(await done(12), 'C1 VDD 10 V, VGS = VTH + 0.3, RD 270');
  const C = [];
  for (const [t, n] of [['R270', 13], ['R470', 14], ['R1k', 15]]) {
    if (t !== 'R270') { await H.focus('board'); await H.del(16, 23); await H.place(t, 16, 23); }
    const vds = await rd(1), v = await rd(0); C.push([v, vds]);
    ok(await done(n), `C ${t}: VRD ${v}, VDS ${vds}`);
  }
  await page.screenshot({ path: '/tmp/exp7-' + vp + '-board.png' });
  await H.focus('psu'); await H.key('p:PWR'); ok(await done(16), 'C6 off — all steps done');
  const r3 = x => x.toFixed(3), F = { a_vth: r3(vth), q1c: 'sat', q1d: 'tri', q4: 'a', q5a: 'a', q5c: 'tri' };
  [1, 2, 3].forEach(k => { tab[k].forEach((x, j) => F[`b${k}_${j}`] = r3(x)); const id = j => +F[`b${k}_${j}`]; F['q2_' + k] = (1.5 / (id(7) - id(6))).toFixed(2); F['q3_' + k] = (0.05 / (id(0) * 1e-3)).toFixed(1); });
  [270, 470, 1000].forEach((R, i) => { F['c_vrd' + i] = r3(C[i][0]); F['c_vds' + i] = r3(C[i][1]); F['c_id' + i] = r3(+F['c_vrd' + i] / R * 1e3); });
  F.q5b = ((10 - 0.3) / (+F.c_id0 * 1e-3)).toFixed(0);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('plotBtn').click(); document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
