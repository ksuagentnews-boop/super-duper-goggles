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
  ok(await page.evaluate(() => { const c = BENCH.sim.RT.crossings(); return !c.cc.length && !c.ci.length; }), 'default layout: no cable crosses another cable or an instrument');
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
  // overview: controls, parts and leads work without zooming; a tap on a device body zooms; the side parts box folds
  await page.evaluate(() => BENCH.back()); await page.waitForTimeout(500);
  const view = () => page.evaluate(() => BENCH.view);
  if (vp === 'desktop') { const c = await page.$eval('#bench [data-k="p:LON"]', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    await page.mouse.move(c[0], c[1]); await page.waitForTimeout(60); ok(await page.evaluate(() => !!document.querySelector('#Lhl2 rect')) && (await view()) === 'ov', 'overview: hovering a control outlines it (no click)'); }
  await H.key('p:LON'); ok((await view()) === 'ov' && !(await page.evaluate(() => BENCH.sim.RT.S.psu.u[0].on)), 'overview: a supply key works at once and does not zoom');
  ok(await page.$eval('#drawer', e => e.offsetWidth > 60 && getComputedStyle(e).display !== 'none'), 'side parts box is open next to the board');
  await H.place('R100', 30, 31); ok((await view()) === 'ov' && await page.evaluate(() => BENCH.sim.RT.S.parts.some(p => p.a === 30 && p.b === 31)), 'overview: placing a part works without zooming');
  await H.lead('mh', 30); ok((await view()) === 'ov' && await page.evaluate(() => BENCH.sim.RT.S.leads.mh.node === 30), 'overview: moving a lead works without zooming');
  const rg = await page.evaluate(() => BENCH.sim.regions.dmm); await H.tap(rg[0] + rg[2] * 0.5, rg[1] + 52); await page.waitForTimeout(500);
  ok((await view()) === 'dmm', 'tapping the DMM body zooms on it');
  await page.evaluate(() => BENCH.back()); await page.waitForTimeout(300);
  await page.click('#dClose'); ok(await page.$eval('#drawer', e => e.offsetWidth < 50), 'the arrow folds the parts box');
  await page.click('#dClose'); ok(await page.$eval('#drawer', e => e.offsetWidth > 60), 'and opens it again');
  // movable instruments: the ✋ handle moves the DMM (mouse or finger), its cables follow, nothing on it is pressed;
  // the arrangement is remembered for this experiment and "ترتيب افتراضي" restores the default
  const pos = () => page.evaluate(() => ({ ...BENCH.sim.RT.layout.POS.dmm }));
  const dmmState = () => page.evaluate(() => JSON.stringify(BENCH.sim.RT.S.dmm));
  const p0 = await pos(), st0 = await dmmState();
  const hb = await page.$eval('#bench [data-k="mv:dmm"]', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const scale = await page.evaluate(() => document.getElementById('bench').getScreenCTM().a);
  if (vp === 'phone') { const cdp = await page.context().newCDPSession(page); const tp = (x, y) => [{ x, y, id: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(hb[0], hb[1]) });
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(hb[0] - 10 * i, hb[1] + 6 * i) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await page.mouse.move(hb[0], hb[1]); await page.mouse.down(); await page.mouse.move(hb[0] - 60, hb[1] + 36, { steps: 6 }); await page.mouse.up(); }
  await page.waitForTimeout(150);
  const p1 = await pos(); const want = { x: p0.x - 60 / scale, y: p0.y + 36 / scale };
  ok(Math.abs(p1.x - want.x) < 3 && Math.abs(p1.y - want.y) < 3 && (await view()) === 'ov', `${vp === 'phone' ? 'finger' : 'mouse'} drag on ✋ moves the DMM (${Math.round(p1.x - p0.x)}, ${Math.round(p1.y - p0.y)}) without zooming`);
  ok((await dmmState()) === st0, 'moving the DMM pressed none of its controls');
  const cab = await page.evaluate(() => { const d = document.querySelector('#Lcables [data-cab="ml"] path').getAttribute('d').match(/M([\d.-]+) ([\d.-]+)/); const L = BENCH.sim.RT.layout; return { x: +d[1], y: +d[2], want: { x: L.POS.dmm.x + 440, y: L.POS.dmm.y + 116 } }; });
  ok(Math.abs(cab.x - cab.want.x) < 1 && Math.abs(cab.y - cab.want.y) < 1, 'the COM cable stays on the moved jack');
  ok(await page.evaluate(() => !!localStorage.getItem('eelab:layout:ee312/exp1')), 'arrangement saved for this experiment');
  await page.evaluate(() => BENCH.enter('ee312/exp1', 'free', true)); await page.waitForTimeout(300);
  const p2 = await pos(); ok(Math.abs(p2.x - p1.x) < 1 && Math.abs(p2.y - p1.y) < 1, 'arrangement restored on the next visit');
  await page.click('#bLayout'); await page.waitForTimeout(600);
  const p3 = await pos(); const d0 = await page.evaluate(() => BENCH.sim.RT.layout.DEF.dmm);
  ok(Math.abs(p3.x - d0.x) < 1 && Math.abs(p3.y - d0.y) < 1 && !(await page.evaluate(() => localStorage.getItem('eelab:layout:ee312/exp1'))), '"ترتيب افتراضي" restores the default layout');
  await page.evaluate(() => { if (window.__orig) EXP_DEFS['ee312/exp1'] = window.__orig; else delete EXP_DEFS['ee312/exp1']; }); await page.click('#bStand'); await page.waitForTimeout(400);
}

