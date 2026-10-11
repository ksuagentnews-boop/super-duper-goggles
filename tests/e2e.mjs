// Headless end-to-end checks.  Run:  THREE_JS=/path/to/three.min.js node tests/e2e.mjs [desktop,phone]
// (THREE_JS is only needed when cdnjs is not reachable.)
import { chromium, openPage, sit, bench } from './lib.mjs';
const VPS = (process.argv[2] || 'desktop,phone').split(',');
const browser = await chromium.launch();
const errors = [], fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? '  ✓ ' : '  ✗ ') + msg); };

async function hall(page, vp) {
  console.log(`[${vp}] hall + quick access`);
  const info = await page.evaluate(() => HALL.debug.benches().map(b => ({ num: b.num, x: b.x, z: b.z, built: b.built })));
  ok(info.length === 10, '10 tables in the hall');
  ok(info.slice(0, 5).every((b, i) => b.num === i + 1) && info.slice(5).every((b, i) => b.num === i + 6), 'row 1 = Exp 1–5, row 2 = Exp 6–10');
  ok(info.slice(0, 5).every(b => b.z === info[0].z) && info[5].z > info[0].z && info.slice(0, 5).every((b, i, a) => !i || b.x > a[i - 1].x), 'two rows, left to right');
  ok(await page.evaluate(() => HALL.debug.cur().kind === 'room' && HALL.debug.cur().lab === 'ee312'), 'with one lab the site opens straight into its room');
  ok(await page.evaluate(() => HALL.debug.doors().some(d => d.label === 'EXIT')), 'the room has an exit door to the corridor');
  const corr = await page.evaluate(() => { HALL.debug.show('corridor', null, 'ee312'); const d = HALL.debug.doors(); return { n: d.length, labels: d.map(x => x.label), labs: REGISTRY.labs.map(l => l.code) }; });
  ok(corr.n === corr.labs.length && corr.labels.join() === corr.labs.join(), `corridor has one door per registered lab (${corr.labels})`);
  await page.waitForTimeout(150);
  await page.evaluate(() => { const D = HALL.debug.doors().find(d => d.label === 'EE312'); D.go(); });
  ok(await page.evaluate(() => HALL.debug.cur().lab === 'ee312' && HALL.debug.benches().length === 10), 'entering the EE312 door loads its room with its tables');
  await page.click('#quickBtn');
  ok(await page.$eval('#quick', e => !e.hidden && e.querySelectorAll('[data-lab]').length === 1), 'quick access level 1 lists the labs');
  await page.click('#quick [data-lab="ee312"]');
  const items = await page.$$eval('#quick [data-exp]', a => a.map(b => ({ id: b.dataset.exp, off: b.classList.contains('off'), soon: !!b.querySelector('.soon') })));
  ok(items.length === 10, 'level 2 lists the 10 experiments');
  ok(items.filter(i => i.off).every(i => i.soon) && items.filter(i => !i.off).map(i => i.id).join() === 'ee312/exp3,ee312/exp4', 'unbuilt ones greyed with قريباً');
  await page.$eval('#quick [data-exp="ee312/exp1"]', b => b.click());
  ok(await page.$eval('#seatModal', e => e.hidden), 'greyed experiment does nothing');
  await page.keyboard.press('Escape');
}

async function measureText(page, label) {
  return page.evaluate(label => { const t = [...document.querySelectorAll('#Ldyn text')].map(e => e.textContent).find(s => s.startsWith(label)); if (!t) return null;
    const m = t.match(/(-?[\d.]+)(mV|V)$/); return m ? +m[1] * (m[2] === 'mV' ? 1e-3 : 1) : null; }, label);
}

async function exp3(page, vp) {
  console.log(`[${vp}] Exp 3 · Manual mode`);
  await sit(page, 'ee312/exp3', 'manual');
  const H = bench(page); H.touch = vp === 'phone';
  await H.focus('gen'); await H.key('g:PWR'); await H.focus('psu'); await H.key('p:PWR'); await H.focus('sc'); await H.key('s:PWR');
  ok((await H.steps()).done === 1, 'step 1 (power) ticks');
  await H.focus('psu'); await H.key('p:LI-', 5); await H.key('p:LVC-', 3); await H.key('p:LON');
  ok((await H.steps()).done === 2, 'step 2 (EL302RD unit set to 2 V / 0.05 A, dc ON) ticks');
  await H.focus('board'); await H.place('R1k', 0, 1); await H.place('D4001', 1, 2); await H.place('D4001', 1, 8); await H.flip(1, 8); await H.place('Z4733', 8, 15);
  await H.lead('gr', 0); await H.lead('c2r', 1); await H.lead('Lp', 2); await H.lead('Lm', 15); await H.lead('gb', 15); await H.lead('c2b', 15);
  ok((await H.steps()).done === 3, 'step 3 (circuit) ticks');
  await H.lead('c1r', 0); await H.lead('c1b', 15);
  ok((await H.steps()).done === 4, 'step 4 (probes + grounds) ticks');
  await H.focus('gen'); await H.key('g:Sine'); await H.gen('F1', '200', 'F3'); await H.gen('F2', '6', 'F2'); await H.gen('F3', '0', 'F2'); await H.key('g:CH1');
  ok((await H.steps()).done === 5, 'step 5 (generator) ticks');
  await H.focus('sc'); await H.key('s:Default'); await H.key('s:CH2');
  ok((await H.steps()).done === 6, 'step 6 (scope channels) ticks');
  await H.key('s:Autoset'); ok((await H.steps()).done === 7, 'step 7 (Autoset) ticks');
  await page.evaluate(() => document.querySelector('[data-cap="f2"]').click());
  // CH2 Max / Min measurements, chosen through the Measure menu like on the real scope
  await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  await page.waitForTimeout(1400);
  const vop = await measureText(page, '②Max');
  await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok((await H.steps()).done === 8, 'step 8 (XY) ticks');
  await page.evaluate(() => document.querySelector('[data-cap="f3"]').click());
  await H.focus('gen'); await H.gen('F2', '16', 'F2'); await H.focus('sc'); await H.key('s:Autoset');
  ok((await H.steps()).done === 9, 'step 9 (16 Vpp) ticks — all steps done');
  await page.waitForTimeout(1400);
  const vom = await measureText(page, '②Min');
  await page.evaluate(() => document.querySelector('[data-cap="f4"]').click());
  await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1');
  await page.evaluate(() => document.querySelector('[data-cap="f5"]').click());
  ok(vop > 2.4 && vop < 2.8 && vom < -5.3 && vom > -6, `Vo+ = ${vop} V, Vo− = ${vom} V from the scope measurements`);
  await page.evaluate(([vop, vom]) => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change')); };
    set('vop', vop.toFixed(2)); set('vom', vom.toFixed(2)); set('vzf', 'b'); set('vz', (Math.abs(vom) - 0.62).toFixed(2)); set('obs', 'b');
    Object.entries({ p1: 1, p2: 2, pz: 2, n1: 2, n2: 1, nz: 3 }).forEach(([k, v]) => set(k, v)); set('why', 'b'); document.getElementById('submit').click(); }, [vop, vom]);
  const res = await page.$eval('#result', e => e.innerText);
  ok(/النتيجة: (\d+) \/ \1/.test(res), 'manual sheet graded full marks: ' + res.split('\n')[0]);
  if (!/النتيجة: (\d+) \/ \1/.test(res)) console.log(res);
  // Free mode: same bench, no steps and no sheet questions
  await page.click('#bSwitch'); await page.waitForTimeout(500);
  ok(await page.evaluate(() => BENCH.mode === 'free' && document.querySelector('#stepCard').hidden && getComputedStyle(document.querySelector('#live')).display === 'none'), 'Free mode: no steps, no checks');
  await page.click('#bStand'); await page.waitForTimeout(400);
}

async function exp4(page, vp) {
  console.log(`[${vp}] Exp 4 · Manual mode`);
  await sit(page, 'ee312/exp4', 'manual');
  const H = bench(page); H.touch = vp === 'phone';
  await H.focus('sc'); await H.key('s:PWR');
  await H.focus('board'); await H.lead('tB', 9); await H.lead('tA', 0); await H.lead('tC', 7);
  await H.place('D', 0, 1); await H.place('D', 7, 8); await H.place('BR', 1, 8); await H.place('R47', 1, 2); await H.place('BR', 2, 9);
  await H.lead('c1r', 0); await H.lead('c2r', 1); await H.lead('c1b', 2); await H.lead('c2b', 9);
  await H.focus('xf'); await H.key('x:CHECK'); ok((await H.steps()).done === 2, 'instructor check passes');
  await H.key('x:PLUG'); ok((await H.steps()).done === 3, 'transformer plugged, full-wave seen');
  await H.focus('sc'); await H.key('s:Default'); await H.key('s:CH2'); await H.key('s:Autoset'); ok((await H.steps()).done === 4, 'full-wave displayed');
  await H.focus('board'); await H.del(7, 8); ok((await H.steps()).done === 5, 'half-wave without D2');
  await H.place('D', 7, 8); await H.focus('sc'); await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1'); ok((await H.steps()).done === 6, 'VTC (XY)');
  await H.focus('xf'); await H.key('x:PLUG'); await H.focus('board'); await H.place('C470', 8, 9); await H.focus('xf'); await H.key('x:CHECK'); await H.key('x:PLUG');
  await H.focus('sc'); await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S0'); ok((await H.steps()).done === 7, '470 µF filter');
  await H.key('s:CH2'); await H.key('s:B0'); ok((await H.steps()).done === 8, 'CH2 AC coupling');
  await H.focus('board'); await H.del(1, 2); await H.place('R270', 1, 2); ok((await H.steps()).done === 9, 'RL = 270 Ω');
  await H.del(1, 2); await H.place('R100', 8, 15); await H.place('BR', 9, 16); await H.place('BR', 16, 23); await H.place('BR', 22, 23); await H.place('Z', 15, 16); await H.flip(15, 16); await H.place('R270', 15, 22); await H.lead('c2r', 15);
  ok((await H.steps()).done === 10, 'regulator (Fig. 6) — all steps done');
  await page.click('#bStand'); await page.waitForTimeout(400);
}

/* engine check on a sandbox table with the EL302RD and the MT3805 (uses the not-yet-built Exp 1 slot) */
async function instruments(page, vp) {
  console.log(`[${vp}] EL302RD + MT3805`);
  await page.evaluate(() => { EXP_DEFS['ee312/exp1'] = { sheet: '<div class="paper"><h2>engine test</h2></div>', params: () => ({}),
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
  await page.evaluate(() => { delete EXP_DEFS['ee312/exp1']; }); await page.click('#bStand'); await page.waitForTimeout(400);
}

for (const vp of VPS) {
  const { ctx, page } = await openPage(browser, vp, errors, vp);
  try { await hall(page, vp); await exp3(page, vp); await exp4(page, vp); await instruments(page, vp); }
  catch (e) { fails.push(`[${vp}] ${e.message}`); console.log('  ✗ ' + e.stack.split('\n').slice(0, 3).join(' | ')); await page.screenshot({ path: `/tmp/e2e-fail-${vp}.png` }).catch(() => {}); }
  await ctx.close();
}
await browser.close();
console.log(`\n${fails.length ? fails.length + ' FAILED' : 'ALL PASSED'} · console errors: ${errors.length}`); errors.forEach(e => console.log('  ' + e));
process.exit(fails.length || errors.length ? 1 : 0);
