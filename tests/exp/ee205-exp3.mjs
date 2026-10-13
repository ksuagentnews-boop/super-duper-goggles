import { sit, bench } from '../lib.mjs';
/* EE205 Exp 3: Thevenin (Fig. 6a/6b) and maximum power transfer (Fig. 7, Table 1), full-marks grading */
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp3', 'manual');
  const H = bench(page); H.touch = vp !== 'desktop';
  const st = () => page.evaluate(() => BENCH.sim.status().ST);
  const done = async n => (await H.steps()).done >= n;
  const setBox = async target => { await H.focus('yew1'); const d = await page.evaluate(() => BENCH.sim.RT.S.yew1.d.slice());
    for (let j = 0; j < 6; j++) while (d[j] !== target[j]) { await H.key(`y1:D${j}${d[j] < target[j] ? '+' : '-'}`); d[j] += d[j] < target[j] ? 1 : -1; } };
  // ---- Procedure I ----
  await H.focus('board');
  await H.place('R1k', 1, 2); await H.place('R3k3', 2, 9); await H.place('L96', 2, 3); await H.place('BR', 3, 4); await H.place('R10k', 4, 11); await H.place('BR', 9, 10); await H.place('BR', 10, 11);
  await H.lead('gr', 1); await H.lead('gb', 9); ok(await done(1), 'I Fig. 6a built');
  await H.focus('gen'); await H.key('g:PWR'); await H.mtx('f', 1000); await H.mtx('a', 14.14); await H.key('g:OUT'); ok(await done(2), 'I 5 V rms 1 kHz');
  await H.focus('hm1'); await H.key('h1:SW-'); await H.lead('h1v', 4); await H.lead('h1c', 11); ok(await done(3), 'I VR');
  await H.focus('hm2'); await H.key('h2:SW+', 7); await H.focus('board'); await H.del(3, 4); await H.lead('h2ma', 3); await H.lead('h2c', 4); ok(await done(4), `I IR ${JSON.stringify(await st())}`);
  await H.lead('h2ma', null); await H.lead('h2c', null); await H.place('BR', 3, 4); await H.del(4, 11); await H.lead('h1v', 3); ok(await done(6), `I ETH ${JSON.stringify(await st())}`);
  await H.del(1, 2); await H.del(2, 9); await H.lead('y1H', 1); await H.lead('y1L', 2); await H.place('R10k', 4, 11);
  await setBox([7, 6, 7, 0, 0, 0]); ok(await done(7), 'I Fig. 6b built');
  const eth = (await st()).eth; await H.focus('gen'); await H.mtx('a', Math.round(eth * 2 * Math.SQRT2 * 1000) / 1000);
  await H.focus('board'); await H.lead('h1v', 4); await H.del(3, 4); await H.lead('h2ma', 3); await H.lead('h2c', 4);
  await H.lead('h2ma', null); await H.lead('h2c', null); await H.place('BR', 3, 4);
  ok(await done(8), `I Fig. 6b VR IR ${JSON.stringify(await st())}`);
  // ---- Procedure II ----
  await H.focus('gen'); await H.key('g:OUT'); await H.focus('board');
  for (const [a, b] of [[2, 3], [3, 4], [4, 11], [9, 10], [10, 11]]) await H.del(a, b);
  for (const k of ['y1H', 'y1L', 'gr', 'gb', 'h1v', 'h1c']) await H.lead(k, null);
  ok(await done(9), 'II board clear');
  await H.place('R100', 15, 16); await H.place('L175', 16, 17); await H.lead('y1H', 17); await H.lead('y1L', 24);
  for (const [a, b] of [[24, 25], [25, 26], [31, 32], [32, 33]]) await H.place('BR', a, b);
  await H.lead('gr', 15); await H.lead('gb', 31); ok(await done(10), 'II Fig. 7 built');
  await setBox([8, 1, 1, 0, 0, 0]); await H.focus('gen'); await H.mtx('a', 14.14); await H.key('g:OUT'); ok(await done(11), 'II RD = 118 Ω, generator on');
  await H.lead('h1v', 17); await H.lead('h1c', 24); ok(await done(12), 'II M1 on RD');
  const set = async list => { const want = ['C01', 'C047', 'C1'].map(() => null); /* positions: 24-31, 25-32, 26-33 */
    const pos = [[24, 31], [25, 32], [26, 33]]; const cur = await page.evaluate(() => BENCH.sim.RT.S.parts.filter(p => /^C/.test(p.type)).map(p => [p.type, p.a, p.b]));
    for (const [, a, b] of cur) await H.del(a, b); for (let i = 0; i < list.length; i++) await H.place(list[i], pos[i][0], pos[i][1]); };
  const combos = [['C01'], ['C047'], ['C047', 'C01'], ['C1'], ['C1', 'C01'], ['C1', 'C01', 'C01'], ['C1', 'C047'], ['C47'], ['C22']];
  for (const [i, cmb] of combos.entries()) { await set(cmb); ok(await done(13 + i), `II ${cmb.join(' + ')}`); }
  await page.screenshot({ path: `/tmp/ee205-exp3-${vp}.png` });
  await H.focus('gen'); await H.key('g:OUT'); ok(await done(22), 'all steps done ' + JSON.stringify(await st()));
  const S = await st();
  const F = await page.evaluate(S => { const f = {}, r = (x, d) => (+x).toFixed(d), W = 2 * Math.PI * 1000;
    f.vr1 = r(S.vr1, 3); f.ir1 = r(S.ir1 * 1e3, 2); f.eth = r(S.eth, 3); f.zr = r(1000 * 3300 / 4300 + 17.6, 1); f.zx = r(W * 0.096, 1); f.vr2 = r(S.vr2, 3); f.ir2 = r(S.ir2 * 1e3, 2);
    f.rd = 118; f.z7r = 117.6; f.z7x = r(W * 0.0175, 1);
    [['c01', .1], ['c047', .47], ['c057', .57], ['c1', 1], ['c11', 1.1], ['c12', 1.2], ['c147', 1.47], ['c47', 4.7], ['c22', 22]].forEach(([k, c]) => { f[k + 'v'] = r(S[k], 3); f[k + 'x'] = r(1 / (W * c * 1e-6), 1); f[k + 'p'] = r(S[k] * S[k] / 118 * 1e3, 2); });
    f.q6 = 'a'; return f; }, S);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('input')); } document.getElementById('submit').click(); }, F);
  const res = await page.evaluate(() => document.querySelector('#result .result b').textContent + ' | ' + [...document.querySelectorAll('#result .bad')].map(e => e.textContent).join(' ; '));
  const m = res.match(/(\d+) \/ (\d+)/); ok(m && m[1] === m[2], 'sheet full marks: ' + res);
}
