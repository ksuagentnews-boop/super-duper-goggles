import { sit, bench } from '../lib.mjs';
/* EE205 Exp 7: coupled coils on the U-core from the variable ac supply (instructor check), full-marks grading */
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp7', 'exam');
  const H = bench(page); H.touch = vp !== 'desktop';
  const status = () => page.evaluate(() => { const s = BENCH.sim.status(); return { ST: s.ST, Vs: s.Vs, on: s.on }; });
  const done = async n => (await H.steps()).done >= n;
  const power = async () => { await H.chk(); await H.focus('ac'); await H.key('a:PWR'); };
  const off = async () => { if (await page.evaluate(() => BENCH.sim.RT.S.ac.pwr)) { await H.focus('ac'); await H.key('a:PWR'); } };
  const set2 = async () => { await H.focus('ac'); for (let k = 0; k < 80; k++) { const { Vs } = await status(); if (Vs != null && Math.abs(Vs - 2) <= 0.02) return; await H.key(Vs == null || Vs < 2 ? 'a:V+' : 'a:V-'); } };
  /* every circuit in a layout of its own (U-core at node 16, the supply on nodes 14 / 22), not the figures' reference */
  await H.focus('board'); await H.placeIC('UC', 16, [[0, 0], [0, 1], [1, 0], [1, 1]]);
  /* Rdc on M1 (any meter: the manual says "the multimeter") */
  await H.focus('hm1'); await H.key('h1:SW+', 2); await H.lead('h1v', 16); await H.lead('h1c', 23); ok(await done(1), `I1 Rdc1 ${JSON.stringify((await status()).ST)}`);
  ok(await done(2), 'I2 R1 = 1.15 Rdc (calculation)');
  await H.lead('h1v', 17); await H.lead('h1c', 24); ok(await done(3), 'I3 Rdc2');
  await H.place('BR', 15, 16); await H.place('BR', 22, 23); await H.lead('acL', 14); await H.lead('acN', 22); await H.lead('h4ma', 14); await H.lead('h4c', 15); await H.lead('h1v', 14); await H.lead('h1c', 22);
  ok(await done(4), 'I4 Fig. 7 built');
  await power(); ok(await done(5), 'I instructor check, power on');
  await H.focus('hm1'); await H.key('h1:SW-', 3); await H.focus('hm4'); await H.key('h4:SW+', 3); await set2(); ok(await done(7), `I5 coil 1 at 2 V, I6 calculation ${JSON.stringify(await status())}`);
  await off(); await H.focus('board'); await H.lead('h4c', 17); await H.del(22, 23); await H.lead('acN', 24); await H.lead('h1c', 24); await power(); await set2();
  ok(await done(8), `I7 coil 2 ${JSON.stringify((await status()).ST)}`);
  await off(); await H.focus('board'); await H.lead('h4c', 15); await H.place('BR', 22, 23); await H.lead('acN', 22); await H.lead('h1c', 22); await H.lead('h2v', 17); await H.lead('h2c', 24);
  ok(await done(9), 'II1 Fig. 8 built');
  await H.focus('hm2'); await H.key('h2:SW+'); await power(); await set2(); ok(await done(11), 'II2 V1 I1 V2, II3 calculation');
  /* Fig. 9 has no ammeter: a plug in its place */
  await off(); await H.focus('board'); await H.unplug('h4ma'); await H.unplug('h4c'); await H.place('BR', 14, 15); await H.place('BR', 23, 24); await H.lead('h3v', 16); await H.lead('h3c', 17);
  ok(await done(12), 'III1 Fig. 9 built');
  await H.focus('hm3'); await H.key('h3:SW+'); await power(); await set2();
  ok(await done(14), `III2 VT, III3 dot ${JSON.stringify((await status()).ST)}`);
  await off(); await H.focus('board'); await H.lead('h2v', null); await H.lead('h2c', null); await H.lead('h3v', null); await H.lead('h3c', null);
  await H.del(14, 15); await H.lead('h4ma', 14); await H.lead('h4c', 15); await H.del(22, 23); await H.lead('acN', 17); await H.lead('h1c', 17);
  ok(await done(15), 'IV1 Fig. 10 built (aiding)');
  await power(); await set2(); ok(await done(17), 'IV2 aiding, IV3 calculation');
  await off(); await H.focus('board'); await H.del(23, 24); await H.wire(23, 17); await H.lead('acN', 24); await H.lead('h1c', 24); await power(); await set2(); ok(await done(18), 'IV4 opposing');
  await page.screenshot({ path: `/tmp/ee205-exp7-${vp}.png` });
  await off(); ok(await done(21), 'IV5–7 calculations — all steps done ' + JSON.stringify((await status()).ST));
  const S = (await status()).ST;
  const F = await page.evaluate(S => { const f = {}, r = (x, d) => (+x).toFixed(d), W = 2 * Math.PI * 60;
    f.rdc1 = r(S.rdc1, 1); f.r1 = r(1.15 * S.rdc1, 2); f.va = r(S.va, 3); f.ia = r(S.ia * 1e3, 2); f.z1 = r(+f.va / +f.ia * 1e3, 1); f.x1 = r(Math.sqrt(f.z1 ** 2 - f.r1 ** 2), 1); f.l1 = r(+f.x1 / W, 3);
    f.rdc2 = r(S.rdc2, 1); f.r2 = r(1.15 * S.rdc2, 2); f.vb = r(S.vb, 3); f.ib = r(S.ib * 1e3, 2); f.z2 = r(+f.vb / +f.ib * 1e3, 1); f.x2 = r(Math.sqrt(f.z2 ** 2 - f.r2 ** 2), 1); f.l2 = r(+f.x2 / W, 3);
    f.v1m = r(S.v1m, 3); f.i1m = r(S.i1m * 1e3, 2); f.v2m = r(S.v2m, 3); f.xm = r(+f.v2m / +f.i1m * 1e3, 1); f.mm = r(+f.xm / W, 3);
    f.v1p = r(S.v1p, 3); f.v2p = r(S.v2p, 3); f.vtp = r(S.vtp, 3); f.dot = 'B';
    f.vad = r(S.vad, 3); f.iad = r(S.iad * 1e3, 2); f.xe1 = r(Math.sqrt((+f.vad / +f.iad * 1e3) ** 2 - (+f.r1 + +f.r2) ** 2), 1);
    f.vop = r(S.vop, 3); f.iop = r(S.iop * 1e3, 2); f.xe2 = r(Math.sqrt((+f.vop / +f.iop * 1e3) ** 2 - (+f.r1 + +f.r2) ** 2), 1);
    f.m12 = r((+f.xe1 - +f.xe2) / (4 * W), 3); f.kk = r(+f.m12 / Math.sqrt(+f.l1 * +f.l2), 3); return f; }, S);
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('input')); } document.getElementById('submit').click(); }, F);
  const res = await page.evaluate(() => document.querySelector('#result .result b').textContent + ' | ' + [...document.querySelectorAll('#result .bad')].map(e => e.textContent).join(' ; '));
  const m = res.match(/(\d+) \/ (\d+)/); ok(m && m[1] === m[2], 'sheet full marks: ' + res);
}
