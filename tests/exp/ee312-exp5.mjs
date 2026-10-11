import { sit, bench } from '../lib.mjs';
import { measureText } from './ee312-exp3.mjs';
const DIP = [[0, 1], [1, 1], [2, 1], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0]];
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp5', 'manual');
  const H = bench(page); H.touch = vp === 'phone';
  const done = async n => (await H.steps()).done >= n;
  const cap = id => page.evaluate(id => document.querySelector(`[data-cap="${id}"]`).click(), id);
  const meas = l => measureText(page, l);
  const toVd = async (c, target) => { for (let i = 0; i < 14; i++) { const vd = await page.evaluate(c => BENCH.sim.RT.S.sc.ch[c].vd, c); if (Math.abs(vd - target) < 1e-9) return; await H.key(`s:V${c + 1}${vd < target ? '+' : '-'}`); } };
  // ---- Procedure A: IC anchor 8 → pins 8:8 7:9 6:10 5:11 / 1:15 2:16 3:17 4:18; ground = node 23
  await H.focus('board'); await H.placeIC('OA741', 8, DIP);
  ok(await page.evaluate(() => BENCH.sim.RT.S.parts.some(p => p.type === 'OA741' && p.n === 8)), 'µA741 placed on the panel');
  await H.place('R1k', 16, 23); await H.place('R10k', 3, 10); await H.wire(3, 16);
  await H.lead('Rp', 9); await H.lead('Lm', 18); await H.lead('Lp', 23); await H.lead('Rm', 23);
  await H.lead('gr', 17); await H.lead('gb', 23);
  await H.lead('c1r', 17); await H.lead('c2r', 10); await H.lead('c1b', 23); await H.lead('c2b', 23);
  ok(await done(1), 'A1 Fig. 5.4a with ±15 V wiring');
  await H.focus('gen'); await H.key('g:PWR'); await H.key('g:Sine'); await H.gen('F1', '1', 'F2'); await H.gen('F2', '400', 'F1'); await H.gen('F3', '0', 'F2');
  ok(await done(2), 'A2 1 kHz 400 mVpp sine, offset 0');
  await H.focus('sc'); await H.key('s:PWR'); await H.key('s:Default'); await H.key('s:Autoset'); await H.key('s:CH2'); ok(await done(3), 'A3 Default, Autoset, CH1/CH2');
  await toVd(0, 0.1); ok(await done(4), 'A4 CH1 100 mV/div'); await toVd(1, 0.5); ok(await done(5), 'A5 CH2 500 mV/div');
  await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0');
  await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok(await done(6), 'A6 CH2 Pk-Pk, Max, Min');
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LVC+', 10); await H.key('p:RVC+', 3); await H.key('p:LON'); await H.key('p:RON');
  await H.focus('gen'); await H.key('g:CH1'); ok(await done(7), 'A7 supply on, then generator on');
  await H.focus('sc'); await H.key('s:H+', 1); await page.waitForTimeout(300);
  const td = await page.evaluate(() => BENCH.sim.RT.S.sc.td); const vo = await meas('②Pk-Pk');
  await cap('f55'); ok(await done(8), `A8–9 Fig. 5.5 · td ${td} · vO(pp) = ${vo} V · G = ${(vo / 0.4).toFixed(2)}`);
  // bandwidth: type frequencies until vO(pp) = 0.7 × vO(pp at 1 kHz)
  await H.focus('gen'); let lo = 10, hi = 200, bw = null;
  for (let i = 0; i < 12 && !(await done(9)); i++) { const f = +((lo + hi) / 2).toFixed(1); await H.gen('F1', String(f), 'F2'); await page.waitForTimeout(150); const r = (await meas('②Pk-Pk')) / vo; if (r > 0.7) lo = f; else hi = f; bw = f; }
  ok(await done(9), `A10 BW found: ${bw} kHz`);
  await H.gen('F1', '1', 'F2'); ok(await done(10), 'A11 back to 1 kHz');
  await H.focus('sc'); await toVd(1, 5); await H.focus('board'); await H.del(3, 10); await H.place('R100k', 3, 10);
  await H.focus('sc'); await page.waitForTimeout(300); const vox = await meas('②Max'), von = await meas('②Min');
  await cap('f56'); ok(await done(12), `A12–13 Fig. 5.6 · VO+ = ${vox}, VO− = ${von}`);
  await H.focus('gen'); await H.key('g:CH1'); await H.focus('psu'); await H.key('p:PWR'); ok(await done(13), 'A14 generator off, then supply off');
  // ---- Procedure B
  await H.focus('board'); await H.del(3, 10); await H.delWire(3, 16); await H.del(16, 23); await H.place('BR', 16, 23);
  await H.place('R1k', 3, 10); await H.place('D4001', 3, 4); await H.flip(3, 4); await H.flip(3, 4);
  await H.place('Z4733', 4, 5); await H.flip(4, 5); await H.place('D4001', 2, 3); await H.place('D4001', 1, 2);
  await H.place('BR', 23, 24); await H.wire(5, 24); await H.wire(1, 24);
  ok(await done(14), 'B1 Fig. 5.4b assembled'); ok(await done(15), 'B2 same input signal');
  await H.lead('c3r', 3); await H.lead('c3b', 24); await H.focus('sc'); await H.key('s:CH3'); ok(await done(16), 'B3 CH1/CH2/CH3 probes');
  await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0');
  await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok(await done(17), 'B4 CH3 Max / Min'); await toVd(2, 2); ok(await done(18), 'B5 CH3 2 V/div');
  await H.focus('psu'); await H.key('p:PWR'); await H.focus('gen'); await H.key('g:CH1'); ok(await done(19), 'B6 supply then generator on');
  await H.focus('sc'); await toVd(1, 5); await page.waitForTimeout(300);
  const v6x = await meas('②Max'), v6n = await meas('②Min'), v3x = await meas('③Max'), v3n = await meas('③Min');
  await cap('f57'); ok(await done(21), `B7–8 Fig. 5.7 · v6 ${v6x} / ${v6n} · vO ${v3x} / ${v3n}`);
  await page.screenshot({ path: '/tmp/exp5-' + vp + '-scope.png' });
  await H.focus('gen'); await H.key('g:CH1'); await H.focus('psu'); await H.key('p:PWR'); ok(await done(22), 'B9 off — all steps done');
  await H.focus('board'); await page.screenshot({ path: '/tmp/exp5-' + vp + '-board.png' });
  const g = vo / 0.4, F = { a_vi: '0.4', a_vo: vo.toFixed(2), a_g: g.toFixed(2), a_bw: String(bw), a_gbw: (g * bw).toFixed(1), b_vix: '0.2', b_vin: '-0.2', b_vox: vox.toFixed(2), b_von: von.toFixed(2),
    c_v6x: v6x.toFixed(2), c_v6n: v6n.toFixed(2), c_vox: v3x.toFixed(2), c_von: v3n.toFixed(2), q1g: '11', q1c: 'a', q2: (g * bw).toFixed(1), q3a: 'a', q3b: 'a', q4: 'a', q5: 'a', q6: 'a' };
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
