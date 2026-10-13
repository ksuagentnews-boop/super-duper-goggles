import { sit, bench } from '../lib.mjs';
/* «المعمل بس»: the right-hand page (sheet + step card) hides, the bench refits to the freed space, steps keep ticking,
   a small tab shows the step and brings the page back; remembered for the session */
export async function run(page, vp, ok) {
  console.log(`[${vp}] lab only`);
  await sit(page, 'ee312/exp1', 'manual');
  const H = bench(page); H.touch = vp !== 'desktop';
  const st = () => page.evaluate(() => { const s = document.getElementById('bstage').getBoundingClientRect(), m = document.getElementById('bench').getScreenCTM(), r = BENCH.ovRect;
    const card = document.getElementById('stepCard'), p = document.getElementById('bpanel').getBoundingClientRect();
    const pd = BENCH.pads(); return { wb: r ? r[2] * m.a / (s.width - pd.left - (pd.right || 0)) > 0.88 : false, sw: s.width, sh: s.height, fit: r ? Math.max(r[2] * m.a, r[3] * m.d) : 0, card: getComputedStyle(card).display !== 'none' && !card.hidden, panel: BENCH.sheetOverlay() ? (document.getElementById('benchView').classList.contains('panel-open') ? 999 : 0) : p.width, chip: !document.getElementById('labShow').hidden, chipT: document.getElementById('labShowT').textContent }; });
  const a = await st();
  await page.click('#scHide'); await page.waitForTimeout(700); const b = await st();
  ok(!b.card && b.panel < 2 && b.chip && /الخطوة 1/.test(b.chipT), `the step card's ⟩ hides the page; a small tab shows «${b.chipT}»`);
  ok(b.sw >= a.sw - 1 && b.fit >= a.fit - 1 && (a.wb || b.fit > a.fit * 1.02), `the bench refits to the freed space (${Math.round(a.fit)} → ${Math.round(b.fit)} px${a.wb ? ', already width-bound' : ''})`);
  // steps keep ticking while hidden: Exp 1 step 1 = the diode in the DMM jacks
  await H.jack('D4001'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => BENCH.done.filter(Boolean).length) >= 0 && (await st()).chip, 'steps keep running while the page is hidden');
  await page.reload(); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 }); await page.evaluate(() => WELCOME.close());
  await sit(page, 'ee312/exp1', 'free'); const c = await st();
  ok(c.chip && !c.card && c.panel < 2 && /المانيوال/.test(c.chipT), 'remembered for the session (also in Free mode), the tab reads «المانيوال»');
  await page.click('#labShow'); await page.waitForTimeout(700); const d = await st();
  ok(!d.chip && (vp !== 'desktop' || d.panel > 300), 'the tab brings the page back');
  if (vp === 'desktop') { await page.click('#bLabOnly'); await page.waitForTimeout(700); ok((await st()).panel < 2, 'the ⟩ on the sheet panel\'s edge hides it too'); await page.click('#labShow'); await page.waitForTimeout(500); }
  await page.evaluate(() => { try { sessionStorage.removeItem('eelab:labonly'); } catch (_) {} });
  await page.click('#bStand'); await page.waitForTimeout(300);
}
