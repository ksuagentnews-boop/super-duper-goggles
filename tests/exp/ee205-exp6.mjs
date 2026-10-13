import { sit, bench } from '../lib.mjs';
/* EE205 Exp 6: RC charging / discharging and RLC damping on the Hameg, full-marks grading */
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp6', 'manual');
  const H = bench(page); H.touch = vp !== 'desktop';
  const status = () => page.evaluate(() => { const s = BENCH.sim.status(); return { ST: s.ST, os: s.os, tr: s.tr, box: s.box }; });
  const done = async n => (await H.steps()).done >= n;
  const setBox = async target => { await H.focus('yew1'); const d = await page.evaluate(() => BENCH.sim.RT.S.yew1.d.slice());
    for (let j = 0; j < 6; j++) while (d[j] !== target[j]) { await H.key(`y1:D${j}${d[j] < target[j] ? '+' : '-'}`); d[j] += d[j] < target[j] ? 1 : -1; } };
  await H.focus('board'); await H.lead('y1H', 1); await H.lead('y1L', 2); await H.place('C047', 2, 9); await H.lead('gr', 1); await H.lead('gb', 9); await H.lead('c1r', 2); await H.lead('c1b', 9);
  ok(await done(1), 'I Fig. 9 built');
  await setBox([0, 0, 0, 0, 1, 0]); ok(await done(2), 'I box 10 kΩ');
  await H.focus('gen'); await H.key('g:PWR'); await H.key('g:Square'); await H.mtx('a', 10); await H.mtx('o', 5); await H.mtx('f', 200); await H.key('g:OUT'); ok(await done(3), 'I square 0 → 10 V, 200 Hz');
  await H.focus('sc'); await H.key('s:PWR'); await H.key('s:AC1'); await H.key('s:V1-', 2); await H.key('s:TD-', 2); await H.key('s:Y1-', 13); await H.key('s:LV-', 11);
  ok(await done(4), `I charging on screen ${JSON.stringify(await status())}`); await page.screenshot({ path: `/tmp/ee205-exp6-charge-${vp}.png` });
  await H.key('s:SLP'); await H.key('s:LV+', 22); ok(await done(5), `I discharging ${JSON.stringify((await status()).tr)}`); await page.screenshot({ path: `/tmp/ee205-exp6-dis-${vp}.png` });
  await H.focus('gen'); await H.key('g:OUT'); ok(await done(6), 'I generator off');
  await H.focus('board'); await H.del(2, 9); await H.place('L175', 2, 3); await H.place('C047', 3, 10); await H.place('BR', 9, 10); await H.lead('c1r', 3);
  ok(await done(7), 'II Fig. 10 built');
  await setBox([0, 0, 6, 0, 0, 0]); await H.focus('gen'); await H.key('g:OUT'); await H.focus('sc'); await H.key('s:SLP'); await H.key('s:LV-', 22);
  ok(await done(8), `II underdamped ${JSON.stringify(await status())}`); await page.screenshot({ path: `/tmp/ee205-exp6-under-${vp}.png` });
  let rc = null; for (let r = 700; r <= 1500; r += 50) { await setBox([0, Math.floor(r / 10) % 10, Math.floor(r / 100) % 10, Math.floor(r / 1000), 0, 0]); const s = await status(); if (s.os < 0.01) { rc = r; break; } }
  ok(await done(9), `II critical at ${rc} Ω`);
  await setBox([0, 0, 0, 3, 0, 0]); ok(await done(10), 'II overdamped'); await H.focus('gen'); await H.key('g:OUT'); ok(await done(11), 'all steps done');
  const S = (await status()).ST;
  const F = await page.evaluate(([S, rc]) => { const f = {}, T = 10050 * 0.047e-6, r = (x, d) => (+x).toFixed(d);
    const tc = [0.1, 0.25, 0.47, 0.8, 1.2, 2.0];
    tc.forEach((t, i) => { const ch = 10 * (1 - Math.exp(-t / 1e3 / T)), dc = 10 * Math.exp(-t / 1e3 / T); f['ct' + i] = t; f['cth' + i] = r(ch, 2); f['cv' + i] = r(ch + 0.1, 2); f['cd' + i] = r((+f['cv' + i] - +f['cth' + i]) / +f['cth' + i] * 100, 1);
      f['dt' + i] = t; f['dth' + i] = r(dc, 2); f['dv' + i] = r(dc + 0.1, 2); f['dd' + i] = r((+f['dv' + i] - +f['dth' + i]) / +f['dth' + i] * 100, 1); });
    f.tce = 0.48; f.tct = r(T * 1e3, 3); f.tcr = r((0.48 - +f.tct) / +f.tct * 100, 1); f.tde = 0.46; f.tdt = f.tct; f.tdr = r((0.46 - +f.tdt) / +f.tdt * 100, 1);
    f.vr0 = 10; f.ic0 = r(10 / 10050 * 1e3, 3); f.id0 = r(-10 / 10050 * 1e3, 3);
    f.rcm = S.rc; f.rct = r(S.rc + 17.6 + 50, 0); f.rcth = r(2 * Math.sqrt(0.0175 / 0.047e-6), 0);
    const L = 0.0175, C = 0.047e-6; f.fd = r(Math.sqrt(1 / (L * C) - Math.pow(667.6 / (2 * L), 2)) / (2 * Math.PI), 0); f.obs = 'a'; return f; }, [S, rc]);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('input')); } document.getElementById('submit').click(); }, F);
  const res = await page.evaluate(() => document.querySelector('#result .result b').textContent + ' | ' + [...document.querySelectorAll('#result .bad')].map(e => e.textContent).join(' ; '));
  const m = res.match(/(\d+) \/ (\d+)/); ok(m && m[1] === m[2], 'sheet full marks: ' + res);
}
