// Robustness sweep (CLAUDE.md "Pre-launch validation" 2): random and edge actions on every bench in Free mode.
// Pass = no page / console error, no NaN / Infinity / undefined on any display, and the realistic failure behaviour
// (DMM OL / FUSE, supply CC lamp, reversed electrolytic bursts, clipping).  Run:  THREE_JS=… node tests/robust.mjs [n] [desktop]
import { chromium, openPage, sit, bench } from './lib.mjs';
const N = +(process.argv[2] || 160), VP = process.argv[3] || 'desktop';
const EXPS = [...[1, 2, 3, 4, 5, 7, 9, 10].map(n => `ee312/exp${n}`), ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => `ee205/exp${n}`)].filter(id => !process.argv[4] || id.startsWith(process.argv[4]));
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648; const pick = a => a[Math.floor(rnd() * a.length)];
const browser = await chromium.launch(); const errors = [], fails = [], notes = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); return c; };
const BAD = /NaN|Infinity|undefined|null/;
const scan = page => page.evaluate(bad => [...document.querySelectorAll('#bench text, #bench tspan')].map(t => t.textContent).filter(t => new RegExp(bad).test(t)), BAD.source);

for (const n of EXPS) {
  const { ctx, page } = await openPage(browser, VP, errors, n); const e0 = errors.length;
  await sit(page, n, 'free'); const H = bench(page); H.touch = false;
  console.log(`[${VP}] exp${n} · ${N} random actions`);
  const L = await page.evaluate(() => { const R = BENCH.sim.RT; return { NN: R.layout.ROWS * R.layout.COLS, COLS: R.layout.COLS, groups: R.layout.GROUPS, tray: BENCH.sim.tray.map(t => t.t).filter(t => t !== 'W') }; });
  const counts = {}; const bad = new Set();
  for (let i = 0; i < N; i++) {
    const r = rnd(); let kind;
    try {
      if (r < 0.55) { kind = 'control';
        const c = await page.evaluate(seedv => { const els = [...document.querySelectorAll('#bench .Linst [data-k]')].filter(e => !e.dataset.k.startsWith('mv:')); const e = els[Math.floor(seedv * els.length)]; if (!e) return null; const b = e.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2, e.dataset.k]; }, rnd());
        if (c && c[0] > 0 && c[1] > 0) { const hold = /[+-]$/.test(c[2]) && rnd() < 0.3; await page.mouse.click(c[0], c[1]); if (hold) for (let k = 0; k < 40; k++) await page.mouse.click(c[0], c[1]); } }
      else if (r < 0.72) { kind = 'part'; const t = pick(L.tray); const a = Math.floor(rnd() * L.NN); const b = (a % L.COLS < L.COLS - 1 && rnd() < 0.5) ? a + 1 : (a + L.COLS < L.NN ? a + L.COLS : a - 1); await H.place(t, a, b); if (rnd() < 0.4) await H.flip(a, b).catch(() => {}); }
      else if (r < 0.88) { kind = 'lead'; const g = pick(L.groups); const k = await page.evaluate(g => { const R = BENCH.sim.RT; const m = Object.keys(R.S.leads).filter(k => R.lead.grpOf(k) === g); return m[Math.floor(Math.random() * m.length)]; }, g);
        await H.lead(k, rnd() < 0.15 ? null : Math.floor(rnd() * L.NN)); }
      else if (r < 0.94) { kind = 'wire'; const a = Math.floor(rnd() * L.NN), b = Math.floor(rnd() * L.NN); if (a !== b) await H.wire(a, b); }
      else if (r < 0.97) { kind = 'delete'; await page.evaluate(() => { const S = BENCH.sim.RT.S; if (S.parts.length) { S.parts.splice(Math.floor(Math.random() * S.parts.length), 1); BENCH.sim.RT.dirty = true; BENCH.sim.render(); } }); }
      else { kind = 'mode'; /* Free → Manual (answer the procedure picker, it is modal) → Free, quickly */
        const pickGo = async () => { if (await page.evaluate(() => !document.getElementById('procPick').hidden)) await page.click('#ppGo'); };
        await page.click('#bSwitch'); await page.waitForTimeout(60); await pickGo(); await page.click('#bSwitch'); await page.waitForTimeout(60);
        if (await page.evaluate(() => BENCH.mode === 'manual')) { await pickGo(); await page.click('#bSwitch'); await page.waitForTimeout(60); } }
    } catch (e) { notes.push(`exp${n} ${kind}: ${e.message.split('\n')[0]}`); }
    counts[kind] = (counts[kind] || 0) + 1;
    if (i % 20 === 19) { await page.waitForTimeout(250); (await scan(page)).forEach(t => bad.add(t)); }
  }
  await page.waitForTimeout(400); (await scan(page)).forEach(t => bad.add(t));
  ok(errors.length === e0, `exp${n}: no page / console error after ${N} actions (${Object.entries(counts).map(([k, v]) => k + ' ' + v).join(', ')})`);
  ok(!bad.size, `exp${n}: no NaN / Infinity on any display` + (bad.size ? ': ' + [...bad].slice(0, 5).join(' | ') : ''));
  await ctx.close();
}

/* ---- realistic failures ---- */
{ const { ctx, page } = await openPage(browser, VP, errors, 'edge'); await sit(page, 'ee312/exp1', 'free'); const H = bench(page); H.touch = false;
  console.log(`[${VP}] edge cases`);
  const rd = () => page.evaluate(() => { const r = BENCH.sim.RT.inst.dmm.reading(); return r.shown ? (r.shown.main.trim() + ' ' + r.shown.unit + ' ' + (r.shown.flags || '')) : 'off'; });
  // open Ω → OL
  await H.focus('dmm'); await H.key('m:PWR'); await H.key('m:OHM'); await H.lead('mh', 0); await H.lead('ml', 1);
  ok(/OVL|O\.?L/.test(await rd()), 'Ω on open leads reads overload: ' + await rd());
  // supply output shorted by a wire → CC lamp, V collapses
  await H.lead('Lp', 10); await H.lead('Lm', 11); await H.wire(10, 11); await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LON'); await page.waitForTimeout(200);
  const st = await page.evaluate(() => BENCH.sim.RT.psuStat(0)); ok(st.cc && st.v < 0.05, `short on the left unit: CC lamp on, V = ${st.v.toFixed(3)} V`);
  await H.key('p:LON');
  // red lead in the A jack across the supply on DCI: the 10 A fuse blows
  await page.evaluate(() => { const S = BENCH.sim.RT.S; S.wires = []; BENCH.sim.RT.dirty = true; BENCH.sim.render(); });
  await H.lead('mh', 10); await H.lead('ml', 11); await H.focus('dmm'); await H.key('m:JA'); await H.key('m:DCI'); await H.focus('psu'); await H.key('p:LI+', 60); await H.key('p:LON'); await page.waitForTimeout(300);
  const f = await page.evaluate(() => ({ fuse: BENCH.sim.RT.S.dmm.fuse, cc: BENCH.sim.RT.psuStat(0).cc }));
  ok(!f.fuse || f.cc, `A jack straight across the supply: ${!f.fuse ? 'fuse blown (FUSE)' : 'supply in CC (current limit below the fuse)'} · ${await rd()}`);
  ok(!BAD.test(await rd()), 'the DMM display stays a number / message');
  // knobs pinned at both ends
  await H.focus('psu'); await H.key('p:LVC+', 400); await H.key('p:LVF+', 200); let s = await page.evaluate(() => BENCH.sim.RT.S.psu.u[0].v); ok(s <= 30.0001, `supply COARSE/FINE pinned at the top: ${s.toFixed(2)} V (max 30 V)`);
  await H.key('p:LVC-', 400); await H.key('p:LVF-', 200); s = await page.evaluate(() => BENCH.sim.RT.S.psu.u[0].v); ok(s >= 0, `and at the bottom: ${s.toFixed(2)} V`);
  ok(!(await scan(page)).length, 'no NaN on any display after the edge cases');
  await ctx.close(); }
{ const { ctx, page } = await openPage(browser, VP, errors, 'cap'); await sit(page, 'ee312/exp4', 'free'); const H = bench(page); H.touch = false;
  // a 470 µF electrolytic straight on the transformer's ac (A–B): the reverse half-cycles burst it
  // (the instructor's check refuses a reversed capacitor, so it goes in after the check, as a careless student would)
  await H.lead('tA', 0); await H.lead('tB', 1); await H.lead('tC', 2); await H.focus('xf'); await H.key('x:CHECK');
  await H.place('C470', 0, 1); await H.focus('xf'); await H.key('x:PLUG'); await page.waitForTimeout(800);
  const dead = await page.evaluate(() => BENCH.sim.RT.S.parts.some(p => p.dead) || /انفجر/.test(BENCH.sim.RT.S.xf.say || ''));
  ok(dead, 'a polarised capacitor on ac bursts (💥)'); await ctx.close(); }
{ const { ctx, page } = await openPage(browser, VP, errors, 'scope'); await sit(page, 'ee312/exp3', 'free'); const H = bench(page); H.touch = false;
  // every V/div and time/div step, both channels, with a live signal
  await H.lead('gr', 0); await H.lead('gb', 15); await H.lead('c1r', 0); await H.lead('c1b', 15); await H.focus('gen'); await H.key('g:PWR'); await H.key('g:OUT').catch(() => {}); await H.focus('sc'); await H.key('s:PWR');
  const keys = await page.evaluate(() => [...document.querySelectorAll('#bench .Linst [data-k^="s:"]')].map(e => e.dataset.k).filter(k => /[+-]$/.test(k)));
  for (const kk of keys) { await H.key(kk, 25); } await page.waitForTimeout(300);
  ok(!(await scan(page)).length, `scope: ${keys.length} knobs turned to their ends, no NaN on the screen`); await ctx.close(); }

/* EE205: a handheld meter's mA jack straight across the Thandar blows its fuse; the jack then reads 0 until the fuse is replaced;
   the mains-level sources stay off until the instructor checks */
{ const { ctx, page } = await openPage(browser, VP, errors, 'ee205-fuse'); await sit(page, 'ee205/exp1', 'free'); const H = bench(page); H.touch = false;
  await H.lead('h1ma', 2); await H.lead('h1c', 9); await H.lead('Lp', 2); await H.lead('Lm', 9);
  await H.focus('hm1'); await H.key('h1:SW+', 4); await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LI+', 100); await H.key('p:LON'); await page.waitForTimeout(200);
  const f = await page.evaluate(() => ({ fuse: BENCH.sim.RT.S.hm1.fuse.ma, shown: BENCH.sim.RT.inst.hm1.reading().shown, toast: document.getElementById('toast').textContent }));
  ok(!f.fuse && /فيوز/.test(f.toast), `Fluke 300 mA jack across the supply: the fuse blows (${f.toast.slice(0, 30)}…)`);
  ok(f.shown && +f.shown.main === 0, `with the fuse blown the A~/A⎓ reading is 0 (${f.shown && f.shown.main})`); await ctx.close(); }
{ const { ctx, page } = await openPage(browser, VP, errors, 'ee205-lock'); await sit(page, 'ee205/exp4', 'manual'); const H = bench(page); H.touch = false;
  await H.focus('ac'); await H.key('a:PWR'); ok(!(await page.evaluate(() => BENCH.sim.RT.S.ac.pwr)), 'Manual: mains source POWER does nothing before the instructor check');
  ok(!(await page.$('#bench [data-k="a:CHK"]')) && !!(await page.$('#stepCard #scChk')), 'Manual: «المشرف يتأكد من التوصيل» is in the step card, not on the instrument');
  await H.lead('acL', 1); await H.lead('acN', 8); await H.lead('h1ma', 1); await H.lead('h1c', 8); await H.chk();
  ok(!(await page.evaluate(() => BENCH.sim.RT.S.ac.ok)), 'the instructor refuses an ammeter straight across the source'); await ctx.close(); }
{ const { ctx, page } = await openPage(browser, VP, errors, 'ee205-free'); await sit(page, 'ee205/exp4', 'free'); const H = bench(page); H.touch = false;
  ok(!(await page.$('#stepCard #scChk')) && !(await page.$('#bench [data-k="a:CHK"]')), 'Free: no instructor-check button');
  await H.focus('ac'); await H.key('a:PWR'); ok(await page.evaluate(() => BENCH.sim.RT.S.ac.pwr), 'Free: the mains POWER switches without a check'); await ctx.close(); }

await browser.close();
console.log(`\n${fails.length ? fails.length + ' FAILED' : 'ALL PASSED'} · console errors: ${errors.length}`); errors.slice(0, 10).forEach(e => console.log('  ' + e));
if (notes.length) { console.log(`\n${notes.length} action(s) could not be performed (off-screen / occupied — not failures):`); [...new Set(notes)].slice(0, 12).forEach(x => console.log('  · ' + x)); }
process.exit(fails.length || errors.length ? 1 : 0);
