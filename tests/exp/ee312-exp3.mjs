import { sit, bench } from '../lib.mjs';
export async function measureText(page, label) {
  return page.evaluate(label => { const t = [...document.querySelectorAll('#bench .Linst text')].map(e => e.textContent).find(s => s.startsWith(label)); if (!t) return null;
    const m = t.match(/(-?[\d.]+)(mV|V)$/); return m ? +m[1] * (m[2] === 'mV' ? 1e-3 : 1) : null; }, label);
}
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp3', 'exam');
  const H = bench(page); H.touch = vp === 'phone';
  const done = async n => (await H.steps()).done >= n;
  { // one kind of coax cable, like the lab: every coax lead fits every free BNC (scope CH1–CH4 and the generator OUT)
    const r = await page.evaluate(() => { const R = BENCH.sim.RT, L = R.layout; const kinds = [...new Set(L.PL.filter(q => q.kind !== 'banana').map(q => q.kind))];
      const bnc = L.GROUPS.filter(g => g === 'gr' || /^c\dr$/.test(g)); const ids = L.PL.filter(q => q.kind === 'coax').map(q => q.id);
      const lit = ids.map(id => { R.S.pick = id; BENCH.sim.render(); const n = document.querySelectorAll('#bench .pjack').length; R.S.pick = null; return n; }); BENCH.sim.render();
      return { kinds, bnc: bnc.length, lit }; });
    ok(r.kinds.length === 1 && r.kinds[0] === 'coax' && r.lit.every(n => n === r.bnc), `one coax kind; a tap on any coax lead lights all ${r.bnc} free BNCs (${r.lit.join(', ')})`); }
  const cap = id => page.evaluate(id => document.querySelector(`[data-cap="${id}"]`).click(), id);
  /* Fig. 3.4a in a layout of its own (not the reference one): vI = node 0, vO = node 1, ground = {8, 9, 15} */
  await H.focus('board'); await H.place('R1k', 0, 1); await H.place('D4001', 1, 8); await H.place('BR', 8, 15); await H.place('BR', 8, 9);
  await H.place('D4001', 1, 2); await H.flip(1, 2); await H.place('D4001', 2, 9); await H.flip(2, 9);
  ok(await done(1), 'A1 Fig. 3.4a assembled');
  await H.lead('gr', 0); await H.lead('gb', 15); ok(await done(2), 'A2 generator CH1 on the input');
  await H.focus('gen'); await H.key('g:PWR'); await H.key('g:Sine'); await H.gen('F1', '200', 'F3'); await H.gen('F2', '500', 'F1'); await H.gen('F3', '0', 'F2');
  ok(await done(3), 'A3 sine 200 Hz 500 mVpp'); await H.key('g:CH1'); ok(await done(4), 'A4 CH1 output on');
  await H.focus('board'); await H.lead('c1r', 0); await H.lead('c2r', 1); await H.lead('c1b', 15); await H.lead('c2b', 9); ok(await done(5), 'A5 probes and grounds');
  await H.focus('sc'); await H.key('s:PWR'); await H.key('s:Default'); await H.key('s:Autoset'); ok(await done(6), 'A6 Default + Autoset');
  await H.key('s:CH2'); ok(await done(8), 'A7–8 CH2 on, zero on the centre line');
  const toVd = async (c, target) => { for (let i = 0; i < 12; i++) { const vd = await page.evaluate(c => BENCH.sim.RT.S.sc.ch[c].vd, c); if (Math.abs(vd - target) < 1e-9) return; await H.key(`s:V${c + 1}${vd < target ? '+' : '-'}`); } };
  await toVd(0, 0.2); await toVd(1, 0.2); ok(await done(10), 'A9–10 200 mV/div, convenient time base');
  await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok(await done(11), 'A11 CH2 Max / Min measurements');
  await H.focus('gen'); await H.key('g:F2'); await H.key('g:KN+', 10); ok(await done(13), 'A12–13 knob → 1.5 Vpp');
  await page.waitForTimeout(1400); const vop = await measureText(page, '②Max');
  await H.key('g:KN+', 25); ok(await done(14), 'A14 knob → 4 Vpp');
  await H.focus('sc'); await toVd(0, 0.5); await toVd(1, 0.5); ok(await done(16), 'A15–16 500 mV/div'); await page.waitForTimeout(1400); const vom = await measureText(page, '②Min');
  await cap('f36a'); ok(await done(17), 'A17 Fig. 3.6a captured');
  await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1'); ok(await done(18), 'A18 Triggered XY'); await cap('f36b'); ok(await done(19), 'A19 Fig. 3.6b');
  await H.key('s:S0'); ok(await done(20), 'A20 back to YT');
  ok(vop > 0.4 && vop < 0.62 && vom < -1.0 && vom > -1.35, `VO+ = ${vop} V (D1), VO− = ${vom} V (D2 + D3)`);
  await H.focus('gen'); await H.key('g:CH1'); ok(await done(21), 'B1 generator output off');
  await H.focus('board'); await H.del(1, 8); await H.del(1, 2); await H.del(2, 9); await H.place('Z4733', 1, 2); await H.flip(1, 2); await H.place('Z4733', 2, 9);
  ok(await done(22), 'B2 Fig. 3.4b assembled');
  await H.focus('sc'); await toVd(0, 2); await toVd(1, 2); ok(await done(23), 'B3 2 V/div');
  await H.focus('gen'); await H.key('g:CH1'); await H.key('g:CL'); await H.key('g:KN+', 11); ok(await done(25), 'B4–5 knob → 15 Vpp');
  await H.focus('sc'); await page.waitForTimeout(1400); const bop = await measureText(page, '②Max'), bom = await measureText(page, '②Min');
  await cap('f37a'); ok(await done(28), `B6–8 Fig. 3.7a · VO+ = ${bop} V, VO− = ${bom} V`);
  await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1'); await cap('f37b'); ok(await done(30), 'B9–10 Fig. 3.7b');
  await H.key('s:S0'); await H.focus('gen'); await H.key('g:PWR'); await H.focus('sc'); await H.key('s:PWR'); ok(await done(32), 'B11–12 all off — all steps done');
  const F = { a_vop: vop.toFixed(2), a_vom: vom.toFixed(2), b_vop: bop.toFixed(2), b_vom: bom.toFixed(2), q1: 'a', q2: 'a', q2v: vop.toFixed(2), q3: 'a', q3v: (Math.abs(vom) / 2).toFixed(2), q4: 'a', q5: 'a', q5z: (bop - 0.66).toFixed(2), q5d: '0.66', q6: 'a' };
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bSwitch'); await page.waitForTimeout(500);
  ok(await page.evaluate(() => BENCH.mode === 'free' && document.querySelector('#stepCard').hidden && getComputedStyle(document.querySelector('#live')).display === 'none'), 'Free mode: no steps, no checks');
  await page.click('#bStand'); await page.waitForTimeout(300);
}
