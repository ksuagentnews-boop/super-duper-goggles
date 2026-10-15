import { sit, bench } from '../lib.mjs';
import { measureText } from './ee312-exp3.mjs';
/* EE312 Exp 5 on the Digilent breadboard (lab slides 14–35): ±15 V through the binding posts, the µA741 across the
   channel, parts and jumpers hole to hole, mini-grabber hooks on standing jumpers. Exam run of the manual's steps (A 1–14,
   B 1–9) with full-marks grading, every circuit built through the UI in a layout different from the figures' reference
   (Batch 6 item 1), plus wrong circuits (a missing / reversed diode) that must not tick. */
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp5', 'exam');
  const H = bench(page); H.touch = vp !== 'desktop';
  const done = async n => (await H.steps()).done >= n;
  const cap = id => page.evaluate(id => document.querySelector(`[data-cap="${id}"]`).click(), id);
  const meas = l => measureText(page, l);
  const toVd = async (c, target) => { for (let i = 0; i < 14; i++) { const vd = await page.evaluate(c => BENCH.sim.RT.S.sc.ch[c].vd, c); if (Math.abs(vd - target) < 1e-9) return; await H.key(`s:V${c + 1}${vd < target ? '+' : '-'}`); } };
  const toTd = async target => { for (let i = 0; i < 20; i++) { const td = await page.evaluate(() => BENCH.sim.RT.S.sc.td); if (Math.abs(td - target) < 1e-12) return; await H.key(`s:H${td > target ? '-' : '+'}`); } };
  /* breadboard geometry from the page — a layout of its own, not the figures' reference one (Batch 6 item 1): the µA741 at
     columns 5–8 (the reference has 12–15), Vb (+15 V) to the RIGHT vertical rail and Va (−15 V) to the LEFT one, ground on a horizontal rail (the reference: ground on
     the vertical rails, ±15 V on the bottom breadboard's rails) */
  const B = await page.evaluate(() => { const BB = BENCH.sim.RT.layout.BB, st = (b, h, c) => BB.strip(b, h, c - 1);
    return { GND: BB.post('⏚'), VC: BB.post('Vb'), VA: BB.post('Va'), VRL: BB.vrail(1), VRR: BB.vrail(0), GR: BB.rail(2),
      P7: st(0, 0, 6), P6: st(0, 0, 7), P2: st(0, 1, 6), P3: st(0, 1, 7), P4: st(0, 1, 8), VO: st(0, 1, 11), X: st(0, 1, 14), Y: st(0, 1, 9), U: st(0, 0, 5) }; });
  const hole = (n, h) => page.evaluate(([n, h]) => BENCH.sim.RT.layout.holeP(n, h), [n, h]);
  /* ground rail hole of a breadboard column (rails skip every 6th column) */
  const gr = c => { const i = c - 1; return i - Math.floor(i / 6); };
  const tapHole = async (n, h) => { const q = await hole(n, h); await H.tap(q.x, q.y); };
  const part = async (t, a, b) => { await H.bag(t); await tapHole(...a); await tapHole(...b); };
  const jumper = async (a, b) => { await H.bag('W'); await tapHole(...a); await tapHole(...b); await H.bag('W'); };
  const stub = async (n, h) => { await H.bag('JP'); await tapHole(n, h); };
  /* a tap selects the part, then delete (on a crowded phone board a hook's cable can lie over a tiny part: then select it directly) */
  const del = async (a, b) => { const p = await hole(...a), q = await hole(...b); const x = (p.x + q.x) / 2, y = (p.y + q.y) / 2 - 2.5; await H.tap(x, y);
    if (!(await page.$('[data-k="tb:del"]'))) await page.evaluate(([a, b]) => { const R = BENCH.sim.RT, pr = R.S.parts.find(p => p.a === a[0] && p.ha === a[1] && p.b === b[0] && p.hb === b[1]); if (pr) { R.S.sel = pr.id; BENCH.sim.render(); } }, [a, b]);
    await H.key('tb:del'); };
  /* a lead: its plug into the instrument, then its board end: a banana on a post, a hook on the newest free standing jumper of that group */
  const lead = async (k, n) => { await H.toOv(); await H.plugJack(k);
    const to = await page.evaluate(([k, n]) => { const R = BENCH.sim.RT, L = R.layout, d = L.BB.nodes[n];
      if (d.kind === 'post') return L.nodeC(n); const used = new Set(); R.S.pl.forEach(P => P.clips.forEach(c => { if (typeof c.bh === 'string') used.add(c.bh); }));
      const w = R.S.wires.filter(w => w.b == null && w.a === n && !used.has('j' + w.id)).pop(); return w ? L.stubTip(w.id) : null; }, [k, n]);
    const from = await page.evaluate(k => BENCH.sim.RT.lead.leadPos(k), k); await H.drag(from, { x: to.x, y: to.y + 2 }); };
  /* a banana end stacked on another lead's plug in its jack (the blue lead from L + to R −, slide 21) */
  const stackOn = async (k, g) => { await H.toOv(); await H.plugJack(k); const from = await page.evaluate(k => BENCH.sim.RT.lead.leadPos(k), k), to = await page.evaluate(g => BENCH.sim.RT.lead.jackAt(g), g); await H.drag(from, to); };
  const net = (k, n) => page.evaluate(([k, n]) => BENCH.sim.RT.leadNet(k) === BENCH.sim.RT.netOf(n), [k, n]);

  // ---- Procedure A · 1. Fig. 5.4a: ±15 V on the posts (slide 21), jumpers to the rails, the IC, R1 and R2 (slides 22–23)
  await H.focus('board');
  await lead('Rp', B.VC); await lead('Lm', B.VA); await lead('Lp', B.GND); await stackOn('Rm', 'Lp');
  ok(await page.evaluate(() => { const R = BENCH.sim.RT; return R.leadNet('Rm') != null && R.leadNet('Rm') === R.leadNet('Lp'); }), 'the blue lead stacked on the L + plug: R − on ground (slide 21)');
  await H.focus('board'); await jumper([B.VC, 1], [B.VRL, 2]); await jumper([B.VA, 1], [B.VRR, 2]); await jumper([B.GND, 2], [B.GR, gr(1)]);
  ok(await net('Rp', B.VRL) && !(await done(1)), 'banana leads on the posts, jumpers to the rails (no IC yet: not Fig. 5.4a)');
  await H.focus('board'); await H.bag('OA741');
  { const c = await page.evaluate(U => { const L = BENCH.sim.RT.layout; const a = L.holeP(U, 4), b = L.holeP(U + L.BB.C + 3, 0); return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }, B.U); await H.tap(c.x, c.y); }
  ok(await page.evaluate(U => BENCH.sim.RT.S.parts.some(p => p.type === 'OA741' && p.n === U), B.U), 'µA741 across the channel at columns 5–8');
  await jumper([B.VRL, 8], [B.P7, 0]); await jumper([B.VRR, 8], [B.P4, 4]);
  await part('R1k', [B.P2, 4], [B.GR, gr(6)]);
  ok(!(await done(1)), 'R2 missing: not yet Fig. 5.4a');
  await part('R10k', [B.P6, 3], [B.P2, 1]);
  ok(await done(1), 'A1 Fig. 5.4a built in a layout of its own (IC at columns 5–8, rails swapped)');
  // ---- A2 the generator on pin 3 through a hook on a standing jumper
  await stub(B.P3, 2); await stub(B.GR, gr(2)); await lead('gr', B.P3); await lead('gb', B.GR);
  ok(await net('gr', B.P3), 'the generator hook on the jumper is on pin 3');
  await H.focus('gen'); await H.key('g:PWR'); await H.key('g:Sine'); await H.gen('F1', '1', 'F2'); await H.gen('F2', '400', 'F1'); await H.gen('F3', '0', 'F2');
  ok(await done(2), 'A2 generator on pin 3: 1 kHz 400 mVpp');
  // ---- A3 scope
  await H.focus('board'); await stub(B.P3, 3); await stub(B.P6, 1); await stub(B.GR, gr(3)); await stub(B.GR, gr(4));
  await lead('c1r', B.P3); await lead('c1b', B.GR); await lead('c2r', B.P6); await lead('c2b', B.GR);
  await H.focus('sc'); await H.key('s:PWR'); await H.key('s:Default'); await H.key('s:Autoset'); await H.key('s:CH2'); ok(await done(3), 'A3 Default, Autoset, CH1 / CH2 hooks');
  await toVd(0, 0.2); ok(await done(4), 'A4 CH1 200 mV/div (slide 34)'); await toVd(1, 1); ok(await done(5), 'A5 CH2 1 V/div (slide 34)');
  await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0');
  await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok(await done(6), 'A6 CH2 Pk-Pk, Max, Min');
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LVC+', 10); await H.key('p:RVC+', 3); await H.key('p:LON'); await H.key('p:RON');
  await H.focus('gen'); await H.key('g:CH1'); ok(await done(7), 'A7 supply (both units 15.00 V) on, then generator on');
  await H.focus('sc'); await toTd(5e-4); await page.waitForTimeout(300); const vo = await meas('②Pk-Pk');
  await cap('f55'); ok(await done(8), 'A8 Fig. 5.5 captured (500 µs/div)');
  ok(await done(9), `A9 vO(pp) = ${vo} V · G = ${(vo / 0.4).toFixed(2)} (slides: 4.56 V, 10.75)`);
  await H.focus('gen'); let lo = 10, hi = 200, bw = null;
  for (let i = 0; i < 12 && !(await done(10)); i++) { const f = +((lo + hi) / 2).toFixed(1); await H.gen('F1', String(f), 'F2'); await page.waitForTimeout(150); const r = (await meas('②Pk-Pk')) / vo; if (r > 0.7) lo = f; else hi = f; bw = f; }
  ok(await done(10), `A10 BW found: ${bw} kHz (slide 28: ≈ 69 kHz)`);
  await H.gen('F1', '1', 'F2'); ok(await done(11), 'A11 back to 1 kHz');
  await H.focus('sc'); await toVd(1, 5); await H.focus('board'); await del([B.P6, 3], [B.P2, 1]); await part('R100k', [B.P6, 3], [B.P2, 1]);
  await H.focus('sc'); await page.waitForTimeout(300); const vox = await meas('②Max'), von = await meas('②Min');
  await cap('f56'); ok(await done(13), `A12–13 Fig. 5.6 · VO+ = ${vox}, VO− = ${von} (slide 30: +14.2 / −14.0 V)`);
  await H.focus('gen'); await H.key('g:CH1'); await H.focus('psu'); await H.key('p:PWR'); ok(await done(14), 'A14 generator off, then supply off');
  // ---- Procedure B (slide 31)
  await H.focus('board'); await del([B.P6, 3], [B.P2, 1]); await del([B.P2, 4], [B.GR, gr(6)]);
  await jumper([B.P2, 4], [B.GR, gr(7)]); await part('R1k', [B.P6, 3], [B.VO, 1]);
  await part('D4001', [B.VO, 2], [B.X, 2]); await part('Z36', [B.GR, gr(14)], [B.X, 4]); await part('D4001', [B.Y, 2], [B.VO, 3]);
  ok(!(await done(15)), 'D4 missing: not yet Fig. 5.4b');
  await part('D4001', [B.Y, 4], [B.GR, gr(9)]);
  ok(!(await done(15)), 'D4 reversed: not Fig. 5.4b');
  await del([B.Y, 4], [B.GR, gr(9)]); await part('D4001', [B.GR, gr(9)], [B.Y, 4]);
  ok(await done(15), 'B1 Fig. 5.4b on the breadboard'); ok(await done(16), 'B2 same input signal');
  await stub(B.VO, 4); await stub(B.GR, gr(16)); await lead('c3r', B.VO); await lead('c3b', B.GR); await H.focus('sc'); await H.key('s:CH3'); ok(await done(17), 'B3 CH3 hook on vO');
  await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0');
  await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok(await done(18), 'B4 CH3 Max / Min'); await toVd(2, 2); ok(await done(19), 'B5 CH1 200 mV, CH2 5 V, CH3 2 V/div');
  await H.focus('psu'); await H.key('p:PWR'); await H.focus('gen'); await H.key('g:CH1'); ok(await done(20), 'B6 supply then generator on');
  await H.focus('sc'); await page.waitForTimeout(300);
  const v6x = await meas('②Max'), v6n = await meas('②Min'), v3x = await meas('③Max'), v3n = await meas('③Min');
  await cap('f57'); ok(await done(22), `B7–8 Fig. 5.7 · v6 ${v6x} / ${v6n} (slide 33: +13.8 / −13.2) · vO ${v3x} / ${v3n} (slide: +4.24 / −1.44)`);
  await page.screenshot({ path: '/tmp/exp5-' + vp + '-scope.png' });
  await H.focus('gen'); await H.key('g:CH1'); await H.focus('psu'); await H.key('p:PWR'); ok(await done(23), 'B9 off — all steps done');
  await H.focus('board'); await page.screenshot({ path: '/tmp/exp5-' + vp + '-board.png' });
  const g = vo / 0.4, F = { a_vi: '0.4', a_vo: vo.toFixed(2), a_g: g.toFixed(2), a_bw: String(bw), a_gbw: (g * bw).toFixed(1), b_vix: '0.2', b_vin: '-0.2', b_vox: vox.toFixed(2), b_von: von.toFixed(2),
    c_v6x: v6x.toFixed(2), c_v6n: v6n.toFixed(2), c_vox: v3x.toFixed(2), c_von: v3n.toFixed(2), q1g: '11', q1c: 'a', q2: (g * bw).toFixed(1), q3a: 'a', q3b: 'a', q4: 'a', q5: 'a', q6: 'a' };
  await page.evaluate(F => { for (const [k, v] of Object.entries(F)) { const e = document.getElementById(k); e.value = v; e.dispatchEvent(new Event('change')); } document.getElementById('submit').click(); }, F);
  const res = await page.$eval('#result', e => e.innerText);
  const full = /النتيجة: (\d+) \/ \1/.test(res); ok(full, 'manual sheet graded full marks: ' + res.split('\n')[0]); if (!full) console.log(res);
  await page.click('#bStand'); await page.waitForTimeout(300);
}
