import { sit, bench } from '../lib.mjs';
import { measureText } from './ee312-exp3.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp10', 'manual');
  const H = bench(page); H.touch = vp === 'phone';
  const done = async n => (await H.steps()).done >= n;
  const rd = (k = 0) => page.evaluate(k => BENCH.sim.RT.meters()[k].r.val, k);
  const cap = id => page.evaluate(id => document.querySelector(`[data-cap="${id}"]`).click(), id);
  // ---- A1: each resistor alone on nodes 0–1
  await H.focus('dmm'); await H.key('m:PWR'); await H.key('m:OHM'); await H.focus('board'); await H.lead('mh', 0); await H.lead('ml', 1);
  const R = {};
  for (const t of ['R5k6', 'R4k7', 'R47k', 'R27k']) { await H.place(t, 0, 1); await page.waitForTimeout(100); R[t] = await rd(); await H.del(0, 1); }
  ok(await done(1), 'A1 resistors: ' + Object.entries(R).map(([k, v]) => k + ' ' + v).join(', '));
  // ---- A2: BD137 E 15, C 16, B 17; P = 23/24, G = 14 (+18 by wire)
  await H.placeIC('BD137', 15, [[0, 0], [1, 0], [2, 0]]);
  await H.place('R5k6', 16, 23); await H.place('R47k', 17, 24); await H.place('BR', 23, 24); await H.place('R27k', 17, 18); await H.place('R4k7', 14, 15); await H.wire(18, 14);
  await H.lead('Lp', 23); await H.lead('Lm', 14);
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LVC+', 7); await H.key('p:LON'); ok(await done(2), 'A2 Fig. 10.1, VCC 12 V');
  await H.focus('dmm'); await H.key('m:DCV'); await H.focus('dmm2'); await H.key('m2:PWR'); await H.key('m2:DCV'); await H.focus('board');
  const V = {};
  /* two meters share the seven readings: DMM 1 and DMM 2 alternate */
  for (const [i, [k, h, l]] of [['be', 17, 15], ['bc', 17, 16], ['ce', 16, 15], ['r1', 24, 17], ['r2', 17, 18], ['rc', 23, 16], ['re', 15, 14]].entries()) { const p = i % 2 ? 'm2' : 'm'; await H.lead(p + 'h', h); await H.lead(p + 'l', l); V[k] = await rd(i % 2); }
  await H.lead('m2h', null); await H.lead('m2l', null);
  ok(await done(3), 'A3 dc voltages: ' + Object.entries(V).map(([k, v]) => k + ' ' + v.toFixed(3)).join(' '));
  // ---- B
  await H.place('C470', 15, 22); await H.place('BR', 21, 22); await H.place('BR', 14, 21);
  await H.wire(17, 11); await H.place('C2u2', 11, 12); await H.wire(16, 3); await H.place('C2u2', 3, 4);
  await H.lead('gr', 12); await H.lead('gb', 14);
  ok(await done(4), 'B1 Fig. 10.2');
  await H.lead('c1r', 12); await H.lead('c2r', 4); await H.lead('c1b', 14); await H.lead('c2b', 14);
  await H.focus('sc'); await H.key('s:PWR'); await H.key('s:Default'); await H.key('s:Autoset'); await H.key('s:CH2'); ok(await done(5), 'B2 scope');
  await H.focus('gen'); await H.key('g:PWR'); await H.key('g:Sine'); await H.gen('F1', '1', 'F2'); await H.gen('F2', '20', 'F1'); await H.gen('F3', '0', 'F2'); await H.key('g:CH1'); ok(await done(6), 'B3 20 mVpp 1 kHz');
  await H.focus('sc'); await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S0'); await H.key('s:SEL'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok(await done(7), 'B4 Pk-Pk CH1/CH2'); await H.key('s:Autoset'); await page.waitForTimeout(300);
  const vi = await measureText(page, '①Pk-Pk'), vo = await measureText(page, '②Pk-Pk'); await cap('f104'); ok(await done(8), `B5 Fig. 10.4 · vi ${vi} vo ${vo} → Av ${(vo / vi).toFixed(1)}`);
  await page.screenshot({ path: '/tmp/exp10-' + vp + '-scope.png' });
  await H.focus('gen'); await H.gen('F2', '200', 'F1'); await H.focus('sc'); await H.key('s:Autoset'); await page.waitForTimeout(300); await cap('f105'); ok(await done(9), 'B7 Fig. 10.5');
  await page.screenshot({ path: '/tmp/exp10-' + vp + '-scope2.png' });
  await H.focus('gen'); await H.key('g:CH1'); await H.focus('psu'); await H.key('p:PWR'); ok(await done(10), 'B8 off — all steps done');
  const r3 = x => x.toFixed(3), F = { t_act: 'y', ph: '180', q3: 'a', q4tn: '4' };
  F.t_rc = r3(R.R5k6 / 1e3); F.t_re = r3(R.R4k7 / 1e3); F.t_r1 = r3(R.R47k / 1e3); F.t_r2 = r3(R.R27k / 1e3);
  for (const k in V) F['v_' + k] = r3(V[k]);
  const n = k => +F[k], r4 = x => x.toFixed(4);
  F.t_ic = r4(n('v_rc') / n('t_rc')); F.t_ie = r4(n('v_re') / n('t_re')); F.t_i1 = r4(n('v_r1') / n('t_r1')); F.t_i2 = r4(n('v_r2') / n('t_r2')); F.t_ib = r4(n('t_i1') - n('t_i2'));
  F.t_beta = (n('t_ic') / n('t_ib')).toFixed(1); F.t_alpha = r4(n('t_beta') / (n('t_beta') + 1)); F.t_avt = (-n('t_ic') * n('t_rc') / 0.0259).toFixed(1); F.t_avm = (-vo / vi).toFixed(1);
  F.q2a = r3(n('v_r1') + n('v_r2')); F.q2b = r3(n('v_rc') + n('v_ce') + n('v_re')); F.q2c = r3(n('v_be') - n('v_bc'));
  F.q4re = '1240'; F.q4rc = '1240'; F.q4i2 = '0.8'; F.q4r2 = '7150'; F.q4r1 = '11500';
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
