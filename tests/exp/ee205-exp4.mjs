import { sit, bench } from '../lib.mjs';
/* EE205 Exp 4: power factor improvement of the fluorescent lamp with the capacitor box (instructor check), full marks */
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp4', 'manual');
  const H = bench(page); H.touch = vp !== 'desktop';
  const status = () => page.evaluate(() => { const s = BENCH.sim.status(); return { ST: s.ST, fig4: s.fig4, on: s.on, C: s.C }; });
  const done = async n => (await H.steps()).done >= n;
  await H.focus('board');
  for (const [k, n] of [['acL', 1], ['acN', 10], ['w1i', 1], ['w1ic', 2], ['w1v', 1], ['w1vc', 10], ['h2ma', 2], ['h2c', 3], ['lpL', 3], ['lpN', 10], ['h1v', 1], ['h1c', 10], ['qa', 4], ['qb', 11]]) await H.lead(k, n);
  await H.place('BR', 10, 11); await H.place('BR', 3, 4); ok(await done(1), `Fig. 4 built ${JSON.stringify(await status())}`);
  await H.focus('ac'); await H.key('a:PWR'); ok(!(await done(2)), 'the source stays off until the instructor checks');
  await H.chk(); await H.focus('ac'); await H.key('a:PWR'); await H.focus('pw1'); await H.key('w1:PWR'); await H.focus('hm1'); await H.key('h1:SW-'); await H.focus('hm2'); await H.key('h2:SW+', 7);
  ok(await done(2), 'instructor checked, energized');
  const setC = async c => { await H.focus('cb'); const want = [0, 0, 0, Math.round(c * 10) % 10, Math.floor(c + 1e-9)]; const d = await page.evaluate(() => BENCH.sim.RT.S.cb.d.slice());
    for (let j = 0; j < 5; j++) while (d[j] !== want[j]) { await H.key(`q:D${j}${d[j] < want[j] ? '+' : '-'}`); d[j] += d[j] < want[j] ? 1 : -1; } };
  await setC(0); ok(await done(3), `no C ${JSON.stringify((await status()).ST)}`);
  for (const c of [1, 2, 3]) await setC(c); ok(await done(4), 'C = 1, 2, 3 µF');
  for (let c = 3.2; c <= 6.001; c += 0.2) await setC(+c.toFixed(1)); ok(await done(5), 'C = 3.2 … 6.0 µF');
  await page.screenshot({ path: `/tmp/ee205-exp4-${vp}.png` });
  await H.focus('ac'); await H.key('a:PWR'); ok(await done(6), 'all steps done');
  const S = (await status()).ST;
  const F = await page.evaluate(S => { const f = {}, r = (x, d) => (+x).toFixed(d), W = 2 * Math.PI * 60; let best = null;
    for (const [k, q] of Object.entries(S)) { f[k + 'v'] = r(q.V, 1); f[k + 'i'] = r(q.I, 4); f[k + 'p'] = r(q.P, 2); f[k + 'f'] = r(+f[k + 'p'] / (+f[k + 'v'] * +f[k + 'i']), 3); if (!best || q.I < S[best].I) best = k; }
    const k0 = 'c0'; f.lr = r(+f[k0 + 'p'] / (+f[k0 + 'i']) ** 2, 1); f.lz = r(+f[k0 + 'v'] / +f[k0 + 'i'], 1); f.lx = r(Math.sqrt(f.lz ** 2 - f.lr ** 2), 1); f.lpf = r(+f.lr / +f.lz, 3); f.lt = r(Math.acos(+f.lpf) * 180 / Math.PI, 1);
    f.lc = r(+f.lx / (W * f.lz ** 2) * 1e6, 2); f.cbest = best.slice(1).replace('_', '.'); return f; }, S);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); if (!e) continue; e.value = v; e.dispatchEvent(new Event('input')); } document.getElementById('submit').click(); }, F);
  const res = await page.evaluate(() => document.querySelector('#result .result b').textContent + ' | ' + [...document.querySelectorAll('#result .bad')].map(e => e.textContent).join(' ; '));
  const m = res.match(/(\d+) \/ (\d+)/); ok(m && m[1] === m[2], 'sheet full marks: ' + res);
}
