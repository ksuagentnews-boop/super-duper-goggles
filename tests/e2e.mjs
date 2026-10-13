// Headless end-to-end checks.  Run:  THREE_JS=/path/to/three.min.js node tests/e2e.mjs [desktop,phone] [module,module…]
// Modules live in tests/exp/: hall, instruments, ee312-exp1 … (default: all, in order).
import fs from 'fs'; import path from 'path';
import { chromium, openPage, ROOT } from './lib.mjs';
const VPS = (process.argv[2] || 'desktop,phone').split(',');
const ORDER = ['hall', 'instruments', 'bidi', 'procs', ...Array.from({ length: 10 }, (_, i) => `ee312-exp${i + 1}`)];
const avail = ORDER.filter(m => fs.existsSync(path.join(ROOT, 'tests/exp', m + '.mjs')));
const MODS = process.argv[3] ? process.argv[3].split(',') : avail;
const browser = await chromium.launch();
const errors = [], fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? '  ✓ ' : '  ✗ ') + msg); return cond; };
for (const vp of VPS) {
  for (const m of MODS) {
    const { run } = await import(`./exp/${m}.mjs`);
    const { ctx, page } = await openPage(browser, vp, errors, `${vp}/${m}`);
    console.log(`[${vp}] ${m}`);
    try { await run(page, vp, ok);
      const ll = await page.evaluate(() => (window.BENCH && BENCH.lineLog) || []); if (m.startsWith('ee312-')) { const lj = await page.evaluate(() => { const sim = BENCH.sim; if (!sim || !sim.RT || !sim.RT.plugged || BENCH.mode !== 'manual') return null; const inLines = new Set(); (sim.steps || []).forEach(s => (s.lines || []).forEach(l => { if (l.jack) inLines.add(l.jack); }));
          return [...sim.RT.plugged].filter(g => !inLines.has(g)); }); if (lj) ok(!lj.length, 'every lead the run plugs in has its own line in the Manual steps' + (lj.length ? ': ' + lj.join(', ') : '')); }
        if (m.startsWith('ee312-')) ok(!ll.length, `build lines match the board when each build step ticks` + (ll.length ? ': ' + JSON.stringify(ll) : '')); }
    catch (e) { fails.push(`[${vp}] ${m}: ${e.message}`); console.log('  ✗ ' + e.stack.split('\n').slice(0, 10).join(' | ')); await page.screenshot({ path: `/tmp/e2e-fail-${vp}-${m}.png` }).catch(() => {}); }
    await ctx.close();
  }
}
await browser.close();
console.log(`\n${fails.length ? fails.length + ' FAILED' : 'ALL PASSED'} · console errors: ${errors.length}`); errors.forEach(e => console.log('  ' + e));
process.exit(fails.length || errors.length ? 1 : 0);
