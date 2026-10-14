import { sit, bench } from '../lib.mjs';
/* EE205 Exp 8: series / parallel RLC at 1 kHz, series and parallel resonance sweeps, full-marks grading */
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp8', 'manual');
  const H = bench(page); H.touch = vp !== 'desktop';
  const status = () => page.evaluate(() => { const s = BENCH.sim.status(); return { ST: s.ST, v: s.v }; });
  const done = async n => (await H.steps()).done >= n;
  /* hold the generator terminal at 2 Vrms: AMPL scaled from the present reading (as a student does with the CRO) */
  const hold2 = async () => { await H.focus('gen'); for (let k = 0; k < 4; k++) { const { v } = await status(); if (Math.abs(v - 2) <= 0.01) return;
      const a = await page.evaluate(() => BENCH.sim.RT.S.gen.amp); await H.mtx('a', Math.round(Math.min(20, a * 2 / v) * 100) / 100); } };
  // ---- Procedure I ----
  await H.focus('board'); await H.place('BR', 1, 2); await H.place('R100', 2, 3); await H.place('L175', 3, 4); await H.place('C47', 4, 11); await H.lead('gr', 1); await H.lead('gb', 11);
  ok(await done(1), 'I Fig. 6 built');
  await H.focus('gen'); await H.key('g:PWR'); await H.mtx('f', 1000); await H.key('g:OUT');
  await H.focus('hm1'); await H.key('h1:SW-'); await H.lead('h1v', 1); await H.lead('h1c', 11); await hold2(); ok(await done(2), `I E = 2 V ${JSON.stringify(await status())}`);
  for (const [a, b] of [[2, 3], [3, 4], [4, 11]]) { await H.lead('h1v', a); await H.lead('h1c', b); } ok(await done(3), 'I VR VL VC');
  await H.focus('hm2'); await H.key('h2:SW+', 16); await H.focus('board'); await H.del(1, 2); await H.lead('h2ma', 1); await H.lead('h2c', 2); ok(await done(4), `I current ${JSON.stringify((await status()).ST)}`);
  // ---- Procedure II ----
  await H.focus('gen'); await H.key('g:OUT'); for (const k of ['h1v', 'h1c', 'h2ma', 'h2c', 'gr', 'gb']) await H.lead(k, null);
  await H.focus('board'); for (const [a, b] of [[2, 3], [3, 4], [4, 11]]) await H.del(a, b); ok(await done(5), 'II clear');
  await H.place('C47', 15, 22); await H.place('R100', 16, 23); await H.place('L175', 17, 24);
  for (const [a, b] of [[8, 9], [9, 10], [8, 15], [9, 16], [10, 17], [22, 23], [23, 24], [23, 30], [7, 8]]) await H.place('BR', a, b);
  await H.lead('gr', 7); await H.lead('gb', 30); ok(await done(6), 'II Fig. 7 built');
  await H.focus('gen'); await H.key('g:OUT'); await H.lead('h1v', 8); await H.lead('h1c', 30); await hold2(); ok(await done(7), 'II E');
  for (const [a, b] of [[7, 8], [8, 15], [9, 16], [10, 17]]) { await H.focus('board'); await H.del(a, b); await H.lead('h2ma', a); await H.lead('h2c', b); await H.lead('h2ma', null); await H.lead('h2c', null); await H.place('BR', a, b); }
  ok(await done(8), `II currents ${JSON.stringify((await status()).ST)}`);
  await H.del(23, 30); await H.place('R10', 23, 30); await H.lead('c1r', 8); await H.lead('c1b', 30); await H.lead('c2r', 23); await H.lead('c2b', 30);
  await H.focus('sc'); await H.key('s:PWR'); await H.key('s:DUAL'); ok(await done(9), 'II θ on the CRO'); await page.screenshot({ path: `/tmp/ee205-exp8-theta-${vp}.png` });
  await H.focus('board'); await H.del(23, 30); await H.place('BR', 23, 30); await H.del(22, 23); await H.del(23, 24);
  await H.place('R10', 22, 29); await H.place('R10', 24, 31); await H.place('BR', 29, 30); await H.place('BR', 30, 31); await H.lead('c1r', 22); await H.lead('c2r', 24);
  ok(await done(10), 'II IC vs IL on the CRO');
  // ---- Procedure III ----
  await H.focus('gen'); await H.key('g:OUT'); await H.focus('board');
  const clr = async () => { const ps = await page.evaluate(() => BENCH.sim.RT.S.parts.map(p => [p.a, p.b])); for (const [a, b] of ps) await H.del(a, b); };
  await clr(); ok(await done(11), 'III clear');
  for (const k of ['h1v', 'h1c', 'c2r', 'c2b']) await H.lead(k, null);
  await H.place('R100', 2, 3); await H.place('L175', 3, 4); await H.place('C10n', 4, 11); await H.lead('h2ma', 1); await H.lead('h2c', 2); await H.lead('gr', 1); await H.lead('gb', 11); await H.lead('c1r', 1); await H.lead('c1b', 11);
  await H.focus('hm2'); await H.key('h2:SW-'); ok(await done(12), 'III Fig. 8 built');
  await H.focus('gen'); await H.key('g:OUT');
  for (let f = 7500; f <= 15000; f += 500) { await H.mtx('f', f); await hold2(); }
  ok(await done(14), `III sweep ${JSON.stringify((await status()).ST)}`);
  await H.key('g:OUT'); await H.focus('board'); await clr(); ok(await done(15), 'IV clear');
  await H.place('R5k', 2, 9); await H.place('L438', 3, 10); await H.place('C01', 4, 11); for (const [a, b] of [[2, 3], [3, 4], [9, 10], [10, 11]]) await H.place('BR', a, b);
  await H.lead('gb', 9); await H.lead('c1b', 9); await H.focus('hm2'); await H.key('h2:SW-'); ok(await done(16), 'IV Fig. 9 built');
  await H.focus('gen'); await H.key('g:OUT');
  const fit = async () => { for (let k = 0; k < 3; k++) { const r = await page.evaluate(() => { const m = BENCH.sim.RT.meters().find(q => q.key === 'hm2'); return { ol: m.r.ol, v: m.r.val, pos: BENCH.sim.RT.S.hm2.pos }; });
      if (r.ol) { await H.focus('hm2'); await H.key('h2:SW+'); } else if (r.pos === 15 && Math.abs(r.v) < 0.0019) { await H.focus('hm2'); await H.key('h2:SW-'); } else break; } await H.focus('gen'); };
  for (let f = 6000; f <= 9000; f += 200) { await H.mtx('f', f); await hold2(); await fit(); }
  ok(await done(18), 'IV sweep'); await H.key('g:OUT'); ok(await done(19), 'all steps done');
  const S = (await status()).ST;
  const F = await page.evaluate(S => { const f = {}, r = (x, d) => (+x).toFixed(d), W = 2 * Math.PI * 1000;
    f.e1 = r(S.e1, 3); f.i1 = r(S.i1 * 1e3, 2); f.vr1 = r(S.vr1, 3); f.vl1 = r(S.vl1, 3); f.vc1 = r(S.vc1, 3); f.z1 = r(+f.e1 / +f.i1 * 1e3, 1);
    const X = W * 0.0175 - 1 / (W * 4.7e-6), th = Math.atan2(X, 117.6) * 180 / Math.PI; f.th1 = r(th, 1); f.p1 = r(Math.pow(+f.i1 / 1e3, 2) * 100 * 1e3, 2); f.pf1 = r(Math.cos(th * Math.PI / 180), 3);
    f.e2 = r(S.e2, 3); f.i2 = r(S.i2 * 1e3, 2); f.ir2 = r(S.ir2 * 1e3, 2); f.ic2 = r(S.ic2 * 1e3, 2); f.il2 = r(S.il2 * 1e3, 2); f.zl2 = r(+f.e2 / +f.il2 * 1e3, 1); f.z2 = r(+f.e2 / +f.i2 * 1e3, 1);
    const yr = 0.01 + 17.6 / (17.6 ** 2 + (W * 0.0175) ** 2), yi = W * 4.7e-6 - W * 0.0175 / (17.6 ** 2 + (W * 0.0175) ** 2), th2 = Math.atan2(yi, yr) * 180 / Math.PI; f.th2 = r(th2, 1); f.pf2 = r(Math.cos(th2 * Math.PI / 180), 3); f.p2 = r(Math.pow(+f.ir2 / 1e3, 2) * 100 * 1e3, 2);
    f.cl2 = r(90 + Math.atan2(W * 0.0175, 17.6) * 180 / Math.PI, 1);
    for (let q = 7500; q <= 15000; q += 500) { f['s' + q] = r(S['s' + q] * 1e3, 2); f['sp' + q] = r(Math.pow(+f['s' + q] / 1e3, 2) * 100 * 1e3, 3); }
    for (let q = 6000; q <= 9000; q += 200) { f['q' + q] = r(S['p' + q] * 1e3, 3); f['qz' + q] = r(2 / (+f['q' + q] / 1e3), 0); }
    const fos = 1 / (2 * Math.PI * Math.sqrt(0.0175 * 1e-8)), bs = 117.6 / (2 * Math.PI * 0.0175); f.fos = 12000; f.f1s = r(fos - bs / 2, 0); f.f2s = r(fos + bs / 2, 0); f.bs = r(+f.f2s - +f.f1s, 0); f.qs = r(12000 / +f.bs, 2);
    f.fost = r(fos, 0); f.bst = r(bs, 0); f.f1st = r(fos - bs / 2, 0); f.f2st = r(fos + bs / 2, 0); f.qst = r(fos / bs, 2);
    const fop = 1 / (2 * Math.PI * Math.sqrt(4.38e-3 * 1e-7)), Rp = 1 / (1 / 5000 + 5.2e-7 / 4.38e-3), bp = 1 / (2 * Math.PI * Rp * 1e-7); f.fop = 7600; f.f1p = r(fop - bp / 2, 0); f.f2p = r(fop + bp / 2, 0); f.bp = r(+f.f2p - +f.f1p, 0); f.qp = r(7600 / +f.bp, 2);
    f.fopt = r(fop, 0); f.bpt = r(bp, 0); f.f1pt = r(fop - bp / 2, 0); f.f2pt = r(fop + bp / 2, 0); f.qpt = r(fop / bp, 2); return f; }, S);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('input')); } document.getElementById('submit').click(); }, F);
  const res = await page.evaluate(() => document.querySelector('#result .result b').textContent + ' | ' + [...document.querySelectorAll('#result .bad')].map(e => e.textContent).join(' ; '));
  const m = res.match(/(\d+) \/ (\d+)/); ok(m && m[1] === m[2], 'sheet full marks: ' + res);
}
