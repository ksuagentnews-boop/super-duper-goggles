import { sit, bench } from '../lib.mjs';
const VO = [4.9, 4.5, 3.5, 3.4, 2, 1, 0.5, 0.2, 0.1];
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp9', 'manual');
  const H = bench(page); H.touch = vp === 'phone';
  const done = async n => (await H.steps()).done >= n;
  const rd = () => page.evaluate(() => BENCH.sim.RT.dmm().val);
  const U = u => page.evaluate(u => BENCH.sim.RT.S.psu.u[u].v, u);
  /* unit voltage in mV through COARSE (0.1 V) and FINE (1 mV) presses */
  const setmV = async (side, mv) => { const u = side === 'L' ? 0 : 1; let v = Math.round((await U(u)) * 1000); const dc = Math.trunc((mv - v) / 100); if (dc) await H.key(`p:${side}VC${dc > 0 ? '+' : '-'}`, Math.abs(dc));
    v = Math.round((await U(u)) * 1000); const df = mv - v; if (df) await H.key(`p:${side}VF${df > 0 ? '+' : '-'}`, Math.abs(df)); };
  /* VI (right unit) until the DMM on C–E reads the target; VO falls as VI rises */
  const seek = async target => { const at = async m => { await setmV('R', m); return rd(); };
    let lo = Math.round((await U(1)) * 1000), hi; let r = await rd();
    if (r < target) { hi = lo; lo = 0; } else { hi = lo; let st = 50; while ((r = await at(hi)) > target && hi < 5000) { lo = hi; hi += st; st *= 2; } }
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if ((await at(m)) > target) lo = m; else hi = m; }
    const rl = await at(lo), rh = await at(hi); return Math.abs(rl - target) < Math.abs(rh - target) ? at(lo) : rh; };
  // ---- A: BD137 at 15 (E) 16 (C) 17 (B)
  await H.focus('board'); await H.placeIC('BD137', 15, [[0, 0], [1, 0], [2, 0]]);
  await H.place('R2k7', 16, 23); await H.place('R27k', 17, 24); await H.lead('Lp', 23); await H.lead('Lm', 15); await H.lead('Rp', 24); await H.lead('Rm', 15);
  ok(await done(1), 'A1 Fig. 9.2a');
  await H.focus('psu'); await H.key('p:PWR'); await setmV('L', 5000); await setmV('R', 0); await H.key('p:LON'); await H.key('p:RON'); ok(await done(2), 'A2 VCC 5 V, VI 0 V');
  await H.focus('dmm'); await H.key('m:PWR'); await H.key('m:DCV');
  const tab = [];
  for (const [j, t] of VO.entries()) { await H.focus('board'); await H.lead('mh', 16); await H.lead('ml', 15); await H.focus('psu'); const vo = await seek(t);
    await H.focus('board'); await H.lead('mh', 17); const vbe = await rd(); await H.lead('mh', 24); const vi = await rd(); tab.push([vbe, vi]);
    if (Math.abs(vo - t) > 0.008) console.log('   miss', t, vo); }
  ok(await done(6), 'A3–6 Table 9.2: ' + tab.map(([b, i]) => b.toFixed(3) + '/' + i.toFixed(3)).join(' '));
  // ---- B
  const fill = F => page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); } }, F);
  await fill({ d_rc: '280', d_ib: '1', d_rb: '4300' }); await page.waitForTimeout(100); ok(await done(7), 'B1 design entered');
  await H.focus('dbox'); const dig = await page.evaluate(() => BENCH.sim.RT.S.dbox);
  const setBox = async (k, want) => { for (let j = 0; j < 5; j++) { const d = want[j] - dig[k.toLowerCase()][j]; if (d) await H.key(`b:${k}${j}${d > 0 ? '+' : '-'}`, Math.abs(d)); } };
  await setBox('A', [0, 8, 2, 0, 0]); await setBox('B', [0, 0, 3, 4, 0]); ok(await done(8), 'B2 boxes 280 Ω / 4.3 kΩ');
  await H.focus('board'); await H.del(16, 23); await H.del(17, 24); await H.place('LED', 16, 23); await H.flip(16, 23);
  await H.lead('Lp', 30); await H.lead('dA1', 30); await H.lead('dA2', 23); await H.lead('gr', 25); await H.lead('dB1', 25); await H.lead('dB2', 17); await H.lead('gb', 15);
  await H.focus('psu'); await H.key('p:RON'); ok(await done(9), 'B3 Fig. 9.2b');
  await H.focus('gen'); await H.key('g:PWR'); await H.key('g:Square'); await H.gen('F4', '5', 'F2'); await H.gen('F5', '0', 'F2'); await H.gen('F1', '0.2', 'F3'); await H.key('g:CH1');
  await page.waitForTimeout(300); ok(await done(10), 'B4 0.2 Hz: LED blinks');
  await H.focus('board'); const lit = []; for (let i = 0; i < 6; i++) { lit.push(await page.evaluate(() => { const p = BENCH.sim.RT.S.parts.find(q => q.type === 'LED'); return +BENCH.sim.RT.litNow(p).toFixed(2); })); await page.waitForTimeout(900); }
  ok(Math.max(...lit) > 0.5 && Math.min(...lit) === 0, 'LED blinks on the bench in real time: ' + lit.join(' '));
  await page.screenshot({ path: '/tmp/exp9-' + vp + '-board.png' });
  await H.focus('gen'); await H.gen('F1', '2', 'F3'); ok(await done(11), 'B5 2 Hz'); await H.gen('F1', '60', 'F3'); ok(await done(12), 'B6 60 Hz');
  await H.key('g:CH1'); await H.focus('psu'); await H.key('p:PWR'); ok(await done(13), 'B7 off — all steps done');
  const r3 = x => x.toFixed(3), F = { d_is: '1', d_rcs: '270', d_rbs: '4300', d_60: 'a', q3: 'act', q5: 'a', q6rc: '46.67', q6rb: '1433.3', q6rcs: '47', q6rbs: '1500' };
  VO.forEach((vo, j) => { const [b, i] = tab[j]; F['vbe' + j] = r3(b); F['vi' + j] = r3(i); const vbc = +r3(b) - vo; F['vbc' + j] = r3(vbc); F['md' + j] = +r3(b) < 0.5 ? 'cut' : vbc >= 0.4 ? 'sat' : 'act';
    const ib = (+r3(i) - +r3(b)) / 27, ic = (5 - vo) / 2.7; F['ib' + j] = r3(ib); F['ic' + j] = r3(ic); F['ie' + j] = r3(+r3(ib) + +r3(ic)); });
  F.q4g = (-0.1 / (+F.vi3 - +F.vi2)).toFixed(2); F.q4a = (-0.1 / (+F.vbe3 - +F.vbe2)).toFixed(1);
  await fill(F); await page.evaluate(() => { document.getElementById('plotBtn').click(); document.getElementById('submit').click(); });
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
