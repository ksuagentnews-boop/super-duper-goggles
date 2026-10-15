import { sit } from '../lib.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp2', 'manual', ['III']);
  await page.evaluate(() => { BENCH.fast = true; });
  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(() => { const c = document.getElementById('stepCard'); return { c: BENCH.cur(), sub: (c.querySelector('.subs li.cur .lt') || {}).textContent || '' }; });
    const x = await page.evaluate(() => { const RT = BENCH.sim.RT; return RT.S.hm1.pos + ' ' + RT.leadNet('c1r') + ' ' + RT.leadNet('h1v') + ' ' + RT.leadNet('h1ma'); }); console.log(s.c, s.sub.slice(0, 50), x); if (/الأميتر مكانه/.test(s.sub)) break;
    await page.evaluate(() => { const c = document.getElementById('stepCard'); const b = c.querySelector('#scBuild') || c.querySelector('#scDo') || c.querySelector('#scCap'); if (b) b.click(); });
    await page.waitForFunction(() => !BENCH._doing, null, { timeout: 60000 }); await page.waitForTimeout(40);
  }
  await page.evaluate(() => document.getElementById('stepCard').querySelector('#scDo').click());
  await page.waitForFunction(() => !BENCH._doing, null, { timeout: 60000 }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { const RT = BENCH.sim.RT, st = BENCH.sim.status(); const m = RT.meters().find(q => q.key === 'hm1');
    return { T: st.T, e20: st.e20, noScope: st.noScope, gr: RT.leadNet('gr'), gb: RT.leadNet('gb'), h1ma: RT.leadNet('h1ma'), h1c: RT.leadNet('h1c'), h1v: RT.leadNet('h1v'), m: m && { hi: m.hi, lo: m.lo, D: { fn: m.D.fn, jack: m.D.jack, pwr: m.D.pwr, fuse: m.D.fuse }, r: m.r }, c1: RT.leadNet('c1r'), match: RT.match(BENCH.sim.RT.figs.I).ok }; });
  ok(false, JSON.stringify(r));
}
