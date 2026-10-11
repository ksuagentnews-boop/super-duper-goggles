import { sit, bench } from '../lib.mjs';
/* engine check on a sandbox table with the EL302RD and the MT3805 (uses the not-yet-built Exp 1 slot) */
export async function run(page, vp, ok) {
  console.log(`[${vp}] EL302RD + MT3805`);
  await page.evaluate(() => { window.__orig = EXP_DEFS['ee312/exp1']; EXP_DEFS['ee312/exp1'] = { sheet: '<div class="paper"><h2>engine test</h2></div>', params: () => ({}),
    instruments: [{ type: 'psu' }, { type: 'dmm' }],
    parts: { R100: { t: 'R', r: 100, lab: '100Ω' }, D4001: { t: 'D', lab: '1N4001' }, Z4733: { t: 'Z', lab: '1N4733A' }, BR: { t: 'BR', lab: '' } },
    tray: [['R100', '100 Ω'], ['D4001', '1N4001'], ['Z4733', '1N4733A'], ['BR', 'Bridge'], ['W', 'Wire']], setup: () => ({}) };
    document.querySelector('#hall').hidden = true; BENCH.enter('ee312/exp1', 'free', true); });
  await page.waitForTimeout(400);
  const H = bench(page); H.touch = vp === 'phone';
  const rd = () => page.evaluate(() => { const r = BENCH.sim.RT.inst.dmm.reading(); return r.shown ? (r.shown.main.trim() + ' ' + r.shown.unit) : 'off'; });
  const num = async () => parseFloat((await rd()).replace(/^\s+/, ''));
  await H.focus('dmm'); await H.key('m:PWR'); ok((await rd()).endsWith('V'), 'DMM powers up in DCV: ' + await rd());
  await H.key('m:DIODE'); ok((await rd()).startsWith('OVL.D'), 'diode test, open leads: ' + await rd());
  await H.focus('board'); await H.place('D4001', 0, 1); await H.lead('mh', 0); await H.lead('ml', 1);
  const vf = await num(); ok(vf > 0.45 && vf < 0.65, `1N4001 forward (red on anode): ${await rd()}`);
  await H.flip(0, 1); ok((await rd()).startsWith('OVL.D'), '1N4001 reversed: ' + await rd());
  await H.del(0, 1); await H.place('Z4733', 0, 1); ok((await num()) > 0.45, 'Zener forward: ' + await rd());
  await H.flip(0, 1); ok((await rd()).startsWith('OVL.D'), 'Zener reversed (VZ above the test voltage): ' + await rd());
  await H.del(0, 1); await H.place('R100', 0, 1); await H.focus('dmm'); await H.key('m:OHM');
  ok(Math.abs((await num()) - 100) < 0.01 && (await rd()).endsWith('Ω'), '100 Ω reads ' + await rd());
  // supply: unit L, 5 V / 0.05 A, RS = 100 Ω in series with a forward 1N4001
  await H.focus('board'); await H.del(0, 1);
  await H.place('R100', 14, 15); await H.place('D4001', 15, 22); await H.lead('Lp', 14); await H.lead('Lm', 22); await H.lead('mh', 15); await H.lead('ml', 22);
  await H.focus('psu'); await H.key('p:PWR');
  const disp = () => page.evaluate(() => { const t = [...document.querySelectorAll('#Ldyn text')].map(e => e.textContent); return t; });
  await H.key('p:LI-', 45); await H.key('p:LVC-', 7);
  let st = await page.evaluate(() => BENCH.sim.RT.S.psu.u[0]); ok(Math.abs(st.v - 5) < 1e-9 && Math.abs(st.ilim - 0.05) < 1e-9, 'unit L preset 5.00 V / 0.050 A (dc OFF)');
  ok((await disp()).includes('5.00') && (await disp()).includes('0.050'), 'OFF (PRESET) shows the set voltage and current limit');
  await H.focus('dmm'); await H.key('m:DCV'); await H.focus('psu'); await H.key('p:LON');
  let s = await page.evaluate(() => BENCH.sim.RT.psuStat(0));
  ok(!s.cc && s.i > 0.040 && s.i < 0.046, `CV: I = ${s.i.toFixed(4)} A`);
  const vd = await num(); ok(vd > 0.66 && vd < 0.78, `VD at ≈43 mA: ${await rd()}`);
  await H.key('p:LI-', 3); s = await page.evaluate(() => BENCH.sim.RT.psuStat(0));
  ok(s.cc && Math.abs(s.i - 0.02) < 1e-6 && s.v < 5, `CC at 0.020 A: V = ${s.v.toFixed(2)} V, CC lamp on`);
  await page.evaluate(() => { if (window.__orig) EXP_DEFS['ee312/exp1'] = window.__orig; else delete EXP_DEFS['ee312/exp1']; }); await page.click('#bStand'); await page.waitForTimeout(400);
}

