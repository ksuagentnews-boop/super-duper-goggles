import { sit, bench } from '../lib.mjs';
import { measureText } from './ee312-exp3.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp4', 'exam');
  const H = bench(page); H.touch = vp === 'phone';
  const done = async n => (await H.steps()).done >= n;
  const cap = id => page.evaluate(id => document.querySelector(`[data-cap="${id}"]`).click(), id);
  const pk = async () => { await page.waitForTimeout(1400); return (await measureText(page, '②Pk-Pk')) * 1000; };
  // Fig. 4.2: A = 0, B (center tap, ground) = {9, 2}, C = 14 → bridging plug → 7; D1 0→1, D2 7→8, K = {1, 8}
  await H.focus('board'); await H.lead('tB', 9); await H.lead('tA', 0); await H.lead('tC', 14);
  await H.place('D', 0, 1); await H.place('D', 7, 8); await H.place('BR', 7, 14); await H.place('BR', 1, 8); await H.place('R47', 1, 2); await H.place('BR', 2, 9);
  await H.lead('c1r', 0); await H.lead('c2r', 1); await H.lead('c1b', 2); await H.lead('c2b', 9);
  await H.focus('xf'); await H.key('x:CHECK'); ok(await done(1), 'A0–1 Fig. 4.2 assembled, instructor check passed');
  await H.focus('sc'); await H.key('s:PWR'); await H.key('s:Default'); await H.key('s:Autoset'); ok(await done(2), 'A2 Default + Autoset');
  await H.focus('xf'); await H.key('x:PLUG'); ok(await done(3), 'A3 transformer plugged in, full-wave');
  await H.focus('sc'); await H.key('s:CH2'); ok(await done(4), 'A4–5 CH2 on, zero on the centre line');
  await H.key('s:V1+'); await H.key('s:V2+'); await H.key('s:H+', 6); ok(await done(5), 'A6–7 5 V/div, convenient time base');
  await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S0'); await H.key('s:SEL'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok(await done(6), 'A8–9 Pk-Pk measurements on CH1 and CH2');
  await cap('f44'); ok(await done(7), 'A10 Fig. 4.4');
  await H.focus('board'); await H.del(7, 14); await H.place('BR', 7, 14); ok(await done(8), 'A11 D2 bridging plug removed (half-wave) and put back');
  await H.focus('sc'); await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1'); await cap('f45'); ok(await done(9), 'A12–13 Fig. 4.5 VTC');
  await H.key('s:S0'); ok(await done(10), 'A14 back to YT');
  await H.focus('board'); await H.place('C10', 8, 9); await cap('f46'); ok(await done(11), 'A15 Fig. 4.6 with 10 µF');
  await H.del(8, 9); await H.place('C470', 8, 9); await cap('f47'); ok(await done(12), 'A16 Fig. 4.7 with 470 µF');
  await H.focus('sc'); await H.key('s:CH2'); await H.key('s:B0'); await H.key('s:Autoset'); ok(await done(13), 'A17 CH2 AC + Autoset'); const r1 = await pk();
  await H.focus('board'); await H.del(1, 2); await H.place('R270', 1, 2); ok(await done(14), 'A18 RL = 270 Ω'); await H.focus('sc'); const r2 = await pk();
  ok(r1 > 10 && r1 < 60 && r2 > 300 && r2 < 900, `Vr(pp): ${r1.toFixed(1)} mV @4.7 kΩ, ${r2.toFixed(1)} mV @270 Ω`);
  await H.focus('xf'); await H.key('x:PLUG'); ok(await done(15), 'B1 unplugged');
  await H.focus('board'); await H.del(1, 2); await H.place('R100', 8, 15); await H.place('BR', 9, 16); await H.place('Z', 15, 16); await H.flip(15, 16);
  await H.place('BR', 16, 23); await H.place('BR', 22, 23); await H.place('R47', 15, 22); await H.lead('c2r', 15);
  await H.focus('xf'); await H.key('x:PLUG'); await H.focus('sc'); await H.key('s:CH2'); await H.key('s:B0'); await H.key('s:B0'); await H.key('s:Autoset'); ok(await done(16), 'B2–5 regulator added, CH2 DC + Autoset');
  await cap('f48'); ok(await done(17), 'B6 Fig. 4.8');
  await H.key('s:CH2'); await H.key('s:B0'); await H.key('s:Autoset'); ok(await done(18), 'B7 CH2 AC + Autoset'); const r4 = await pk();
  await H.focus('board'); await H.del(15, 22); await H.place('R270', 15, 22); ok(await done(19), 'B9 RL = 270 Ω'); await H.focus('sc'); const r5 = await pk();
  ok(r5 < r2 / 3 && r4 < r1, `regulated Vr(pp): ${r4.toFixed(1)} mV @4.7 kΩ, ${r5.toFixed(1)} mV @270 Ω`);
  await H.focus('xf'); await H.key('x:PLUG'); await H.focus('sc'); await H.key('s:PWR'); ok(await done(20), 'B12 unplugged, scope off — all steps done');
  const TN = 4, IL = 0.02 * TN, VSM = 15 * Math.SQRT2, Vr = 0.075 * VSM, C = IL / (120 * Vr) * 1e6, IF = 1.5 * IL * (1 + Math.PI * Math.sqrt(VSM / (2 * Vr)));
  const F = { r1: r1.toFixed(1), r2: r2.toFixed(1), r3: (+r2.toFixed(1) - +r1.toFixed(1)).toFixed(1), r4: r4.toFixed(1), r5: r5.toFixed(1), r6: (+r5.toFixed(1) - +r4.toFixed(1)).toFixed(1),
    q1: 'a', q2a: 'dec', q2b: 'inc', q3: 'a', q4: 'a', q5tn: String(TN), q5a: VSM.toFixed(2), q5b: C.toFixed(1), q5c: '60', q5d: IF.toFixed(3), q5e: '1N5392' };
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
