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
  { /* the once-only hint: in the top bar's slack on desktop, never over a top-bar button; not shown on touch */
    await page.evaluate(() => { try { sessionStorage.removeItem('eelab:hint'); } catch (_) {} BENCH._hintShown = false; BENCH.ui(); });
    const r = await page.evaluate(() => { const h = document.getElementById('ovHint'); if (h.hidden) return { shown: false };
      const a = h.getBoundingClientRect(); const hit = [...document.querySelectorAll('#benchView .btop > :not(#ovHint)')].filter(e => { const b = e.getBoundingClientRect(); return b.width && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1; }).map(e => e.id || e.className);
      return { shown: true, hit }; });
    if (vp !== 'desktop') ok(!r.shown, 'touch: no hint bubble (nothing over the top-bar buttons)');
    else ok(r.shown && !r.hit.length, 'the hint sits in the top bar\'s free space, over no button' + (r.hit && r.hit.length ? ': ' + r.hit.join(', ') : '')); }
  ok(await page.evaluate(() => { const c = BENCH.sim.RT.crossings(); return !c.cc.length && !c.ci.length; }), 'default layout: no cable crosses another cable or an instrument');
  ok(await page.evaluate(() => { const S = BENCH.sim.RT.S; return Object.values(S.jack).every(v => !v) && Object.values(S.leads).every(l => l.bn == null && l.node == null); }), 'every lead starts unplugged in the «Coaxial cables & wires» tray');
  { const t = await page.evaluate(() => [...document.querySelectorAll('#Lcables .ltray text')].map(e => e.textContent)); ok(t[0] === 'Coaxial cables & wires' && t.filter(n => n === 'red lead').length === 3 && t.filter(n => n === 'black lead').length === 3, 'the tray is labelled and holds generic leads, named by type: ' + t.slice(1).join(', ')); }
  ok(await page.evaluate(() => !document.querySelector('#Lcables .cablbl text')), 'no lead carries a jack label while nothing is plugged');
  { // tap a lead: every compatible free jack lights up; tap one to plug it there; the label then shows
    const h = await page.evaluate(() => { const R = BENCH.sim.RT; return R.lead.headPos(R.lead.PL.find(q => q.col === 'red').id); }); await H.tap(h.x, h.y);
    const rings = await page.evaluate(() => [...document.querySelectorAll('#bench .pjack')].map(e => e.dataset.k.slice(3)).sort().join());
    ok(rings === 'Lm,Lp,Rm,Rp,mh,ml', `tapping a red lead lights every free banana jack (${rings})`);
    const j = await page.evaluate(() => BENCH.sim.RT.lead.jackAt('Rp')); await H.tap(j.x, j.y);
    ok(await page.evaluate(() => BENCH.sim.RT.S.jack.Rp && !document.querySelector('#bench .pjack')), 'tapping the lit R + plugs it there');
    const lab = await page.evaluate(() => [...document.querySelectorAll('#Lcables .cablbl text')].map(e => e.textContent)); ok(lab.includes('R +'), 'its label R + appears once plugged: ' + lab.join(','));
    const tr = await page.evaluate(() => { const T = BENCH.sim.RT.layout.TRAY; return { x: T.x + T.w / 2, y: T.y + 14 }; });
    await H.drag(j, tr); ok(await page.evaluate(() => !BENCH.sim.RT.S.jack.Rp && BENCH.sim.RT.S.pl.every(P => P.jack == null)), 'its head dropped on the tray puts it back'); }
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
  const disp = () => page.evaluate(() => { const t = [...document.querySelectorAll('#bench .Linst text')].map(e => e.textContent); return t; });
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
  ok(await page.evaluate(() => { const h = document.querySelector('#drawer .dhead b'); return h.textContent.trim() === 'العلبة' && !!h.querySelector('svg.boxic') && !document.body.innerHTML.includes('🎒') && !/الشنطة/.test(document.body.innerHTML); }), 'the parts box is «العلبة» with its box icon (no 🎒, no «الشنطة»)');
  await H.place('R100', 30, 31); ok((await view()) === 'ov' && await page.evaluate(() => BENCH.sim.RT.S.parts.some(p => p.a === 30 && p.b === 31)), 'overview: placing a part works without zooming');
  await H.lead('mh', 30); ok((await view()) === 'ov' && await page.evaluate(() => BENCH.sim.RT.S.leads.mh.node === 30), 'overview: moving a lead works without zooming');
  { const tr = await page.evaluate(() => { const T = BENCH.sim.RT.layout.TRAY; return { x: T.x + T.w / 2, y: T.y + 14 }; });
    const id = await page.evaluate(() => BENCH.sim.RT.lead.plIn('mh'));
    const ja = await page.evaluate(() => BENCH.sim.RT.lead.jackAt('mh')); await H.drag(ja, { x: ja.x + 160, y: ja.y + 120 });
    ok(await page.evaluate(id => { const R = BENCH.sim.RT, P = R.S.pl[id]; return P.jack == null && P.clips[0].bn === 30 && R.S.leads.mh.node == null; }, id), 'pulling the red lead out of HI leaves its clip on the board but out of the circuit');
    const pb = await page.evaluate(id => BENCH.sim.RT.lead.clipPos(id, 0), id); await H.drag(pb, tr);
    ok(await page.evaluate(id => { const P = BENCH.sim.RT.S.pl[id]; return P.jack == null && P.clips[0].bn == null; }, id), 'dropping it on the tray puts the whole lead back');
    await H.lead('mh', 30); ok(await page.evaluate(() => BENCH.sim.RT.S.leads.mh.node === 30), 'plugged again: instrument end first, then the board end'); }
  const rg = await page.evaluate(() => BENCH.sim.regions.dmm); await H.tap(rg[0] + rg[2] * 0.3, rg[1] + 90); await page.waitForTimeout(500);
  ok((await view()) === 'dmm', 'tapping the DMM body zooms on it');
  { await page.waitForTimeout(300); const z = await page.evaluate(() => { const v = document.getElementById('benchView'), st = document.getElementById('bstage').getBoundingClientRect(), pd = BENCH.pads();
      const g = document.querySelector('#bench .Linst [data-inst="dmm"]').getBoundingClientRect(); const aw = st.width, ah = st.height - pd.top - pd.bottom;
      const shown = s => { const e = document.querySelector(s); if (!e) return false; const c = getComputedStyle(e); return c.display !== 'none' && +c.opacity > 0.05; };
      return { fill: Math.max(g.width / aw, g.height / ah), box: shown('#drawer'), board: shown('#Lstatic'), other: shown('#bench .Linst [data-inst="psu"]'), hint: shown('.ovhint') }; });
    ok(z.fill > 0.95 && !z.box && !z.board && !z.other && !z.hint, `device zoom: the DMM alone at ${(z.fill * 100).toFixed(0)} % of the screen; parts box, hint, board and the supply hidden`); }
  await page.keyboard.press('Escape'); await page.waitForTimeout(300); ok((await view()) === 'ov' && await page.$eval('#drawer', e => getComputedStyle(e).display !== 'none'), 'ESC returns to the overview with the parts box back');
  await page.click('#dClose'); ok(await page.$eval('#drawer', e => e.offsetWidth < 50), 'the arrow folds the parts box');
  await page.click('#dClose'); ok(await page.$eval('#drawer', e => e.offsetWidth > 60), 'and opens it again');
  await page.waitForTimeout(300);
  // a diode lifted off the board and dropped on the DMM jacks plugs straight in (Exp 1 Part A method)
  await H.place('D4001', 25, 26);
  const jp = await page.evaluate(() => { const L = BENCH.sim.RT.layout, i = BENCH.sim.RT.inst.dmm, P = L.POS.dmm, r = i.jackSlot; return { x: P.x + r.x + r.w / 2, y: P.y + r.y + r.h / 2 }; });
  const A = await H.node(25), B = await H.node(26); await H.drag({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }, jp);
  ok(await page.evaluate(() => BENCH.sim.RT.S.dmm.jd && BENCH.sim.RT.S.dmm.jd.type === 'D4001' && !BENCH.sim.RT.S.parts.some(p => p.a === 25 || p.b === 25)), 'a diode dragged off the board onto the DMM jacks plugs straight in');
  ok(await page.evaluate(() => !BENCH.sim.RT.S.jack.mh && !BENCH.sim.RT.S.jack.ml), 'the probe leads came out of the jacks into the tray');
  await H.key('m:JDOUT'); await H.plugJack('mh'); await H.plugJack('ml');
  ok(await page.evaluate(() => BENCH.sim.RT.S.jack.mh && BENCH.sim.RT.S.jack.ml), 'leads dragged from the tray plug into HI and COM');
  // wire colours: bucket → swatch → tap the wire; instrument leads keep red (+/signal) and black (−/ground)
  await H.wire(32, 33); const wid = await page.evaluate(() => BENCH.sim.RT.S.wires.at(-1).id);
  ok(await page.evaluate(id => !BENCH.sim.RT.S.wcol[id], wid), 'a new wire on the board is uncoloured');
  await page.click('#pBucket'); await page.click('#pSw [data-c="red"]');
  const wpt = await page.evaluate(id => { const e = document.querySelector(`#bench [data-k="wire:${id}"]`); const q = e.getPointAtLength(e.getTotalLength() / 2); const s = document.getElementById('bench'); const P = s.createSVGPoint(); P.x = q.x; P.y = q.y; const r = P.matrixTransform(s.getScreenCTM()); return [r.x, r.y]; }, wid);
  if (H.touch) await page.touchscreen.tap(wpt[0], wpt[1]); else await page.mouse.click(wpt[0], wpt[1]); await page.waitForTimeout(80);
  ok(await page.evaluate(id => BENCH.sim.RT.S.wcol[id] === 'red', wid), 'pick red, tap the wire: it turns red');
  await page.click('#pSw .px'); ok(await page.evaluate(() => BENCH.paint === null && document.getElementById('pSw').hidden), '✕ leaves colour mode');
  const lc = await page.evaluate(() => ['Lp', 'Lm', 'mh', 'ml'].map(k => document.querySelector(`#Lcables [data-cab="${k}"] path:nth-child(2)`).getAttribute('stroke')).join());
  ok(lc === '#e2453b,#30363a,#e2453b,#30363a', 'supply and DMM leads: red on +/HI, black on −/COM (' + lc + ')');
  // movable instruments: the ✥ handle moves the DMM (mouse or finger), its cables follow, nothing on it is pressed;
  // the arrangement is remembered for this experiment and "ترتيب افتراضي" restores the default
  const pos = () => page.evaluate(() => ({ ...BENCH.sim.RT.layout.POS.dmm }));
  const dmmState = () => page.evaluate(() => JSON.stringify(BENCH.sim.RT.S.dmm));
  const p0 = await pos(), st0 = await dmmState();
  const hb = await page.$eval('#bench [data-k="mv:dmm"] circle:nth-child(2)', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const scale = await page.evaluate(() => document.getElementById('bench').getScreenCTM().a);
  if (vp === 'phone') { const cdp = await page.context().newCDPSession(page); const tp = (x, y) => [{ x, y, id: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(hb[0], hb[1]) });
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(hb[0] - 10 * i, hb[1] + 6 * i) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await page.mouse.move(hb[0], hb[1]); await page.mouse.down(); await page.mouse.move(hb[0] - 60, hb[1] + 36, { steps: 6 }); await page.mouse.up(); }
  await page.waitForTimeout(150);
  const p1 = await pos(); const want = { x: p0.x - 60 / scale, y: p0.y + 36 / scale };
  ok(Math.abs(p1.x - want.x) < 3 && Math.abs(p1.y - want.y) < 3 && (await view()) === 'ov', `${vp === 'phone' ? 'finger' : 'mouse'} drag on ✥ moves the DMM (${Math.round(p1.x - p0.x)}, ${Math.round(p1.y - p0.y)}) without zooming`);
  ok((await dmmState()) === st0, 'moving the DMM pressed none of its controls');
  ok(await page.evaluate(([p0, p1]) => { const L = BENCH.sim.RT.layout; if (BENCH.sim.RT.S.leads.ml.node != null) return true; const d = L.PARK.ml; const f = { x: L.POS.dmm.x + 440, y: L.POS.dmm.y + 116 };
    const d0 = { x: d.x - (p1.x - p0.x), y: d.y - (p1.y - p0.y) }, f0 = { x: f.x - (p1.x - p0.x), y: f.y - (p1.y - p0.y) }; return Math.abs(Math.hypot(d.x - f.x, d.y - f.y) - Math.hypot(d0.x - f0.x, d0.y - f0.y)) < 0.5; }, [p0, p1]), 'the unplugged COM lead travels with the DMM (same length, no old route)');
  const cab = await page.evaluate(() => { const d = document.querySelector('#bench [data-cab="ml"] path').getAttribute('d').match(/M([\d.-]+) ([\d.-]+)/); const L = BENCH.sim.RT.layout; return { x: +d[1], y: +d[2], want: { x: L.POS.dmm.x + 440, y: L.POS.dmm.y + 116 } }; });
  ok(Math.abs(cab.x - cab.want.x) < 1 && Math.abs(cab.y - cab.want.y) < 1, 'the COM cable stays on the moved jack');
  ok(await page.evaluate(() => { const g = document.querySelector('#Ltop [data-inst="dmm"]'), t = document.getElementById('Ltop'), c = document.getElementById('Lcables');
    return !!g && !!(c.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) && !!document.querySelector('#LtopCab [data-cab="ml"]'); }), 'the moved DMM is drawn on top (above the leads, tray and board), its own leads with it');
  const hpx = await page.$eval('#bench [data-k="mv:dmm"] circle:nth-child(2)', e => e.getBoundingClientRect().width);
  ok(hpx >= (vp === 'phone' ? 34 : 26), `the ✥ handle is ${Math.round(hpx)} px on screen`);
  /* drop the DMM right onto the board: it settles to the nearest free spot */
  const hb2 = await page.$eval('#bench [data-k="mv:dmm"] circle:nth-child(2)', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const tgt = await page.evaluate(() => { const b = BENCH.sim.boardRect, m = document.getElementById('bench').getScreenCTM(); return [(b[0] + b[2] / 2) * m.a + m.e, (b[1] + b[3] / 2) * m.d + m.f]; });
  if (vp === 'phone') { const cdp = await page.context().newCDPSession(page); const tp = (x, y) => [{ x, y, id: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(hb2[0], hb2[1]) });
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(hb2[0] + (tgt[0] - hb2[0]) * i / 8, hb2[1] + (tgt[1] - hb2[1]) * i / 8) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await page.mouse.move(hb2[0], hb2[1]); await page.mouse.down(); await page.mouse.move(tgt[0], tgt[1], { steps: 8 }); await page.mouse.up(); }
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => { const L = BENCH.sim.RT.layout, P = L.POS.dmm, z = BENCH.sim.RT.inst.dmm.size, b = BENCH.sim.boardRect;
    const r = [P.x, P.y, z[0], z[1]]; const hit = (a, c) => a[0] < c[0] + c[2] && c[0] < a[0] + a[2] && a[1] < c[1] + c[3] && c[1] < a[1] + a[3];
    const tr = L.TRAY ? [L.TRAY.x, L.TRAY.y, L.TRAY.w, L.TRAY.h] : null; return !hit(r, b) && !(tr && hit(r, tr)); }), 'dropped on the board, the DMM settles to the nearest free spot (off the board and the tray)');
  const p1s = await pos();
  ok(await page.evaluate(() => !!localStorage.getItem('eelab:layout:ee312/exp1')), 'arrangement saved for this experiment');
  await page.evaluate(() => BENCH.enter('ee312/exp1', 'free', true)); await page.waitForTimeout(300);
  const p2 = await pos(); ok(Math.abs(p2.x - p1s.x) < 1 && Math.abs(p2.y - p1s.y) < 1, 'arrangement restored on the next visit');
  await page.click('#bLayout'); await page.waitForTimeout(600);
  const p3 = await pos(); const d0 = await page.evaluate(() => BENCH.sim.RT.layout.DEF.dmm);
  ok(Math.abs(p3.x - d0.x) < 1 && Math.abs(p3.y - d0.y) < 1 && !(await page.evaluate(() => localStorage.getItem('eelab:layout:ee312/exp1'))), '"ترتيب افتراضي" restores the default layout');
  await page.evaluate(() => { if (window.__orig) EXP_DEFS['ee312/exp1'] = window.__orig; else delete EXP_DEFS['ee312/exp1']; }); await page.click('#bStand'); await page.waitForTimeout(400);
}

