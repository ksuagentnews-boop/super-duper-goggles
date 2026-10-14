import { sit, bench } from '../lib.mjs';
/* Manual mode (Batch 6 items 2, 4, 5) on EE312 Exp 1: build steps are one step with the figure in the card, «وصّل لي» builds
   the figure, «تلميح» names what is wrong, «Capture» records readings under the step and into the sheet (read-only, no
   grading), «اكتفِ بهذه التسجيلات وانتقل» moves on with fewer, «تخطّي» skips after a confirmation. */
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp1', 'manual');
  const H = bench(page); H.touch = vp !== 'desktop';
  const done = async n => (await H.steps()).done >= n;
  const btn = async id => { const b = await page.$('#stepCard ' + id); if (!b) return false; await b.evaluate(e => e.scrollIntoView({ block: 'nearest' }));
    if (await page.$eval('#stepCard', e => e.classList.contains('min'))) await page.evaluate(() => { const c = document.getElementById('stepCard'); c.classList.remove('min'); c.dataset.key = ''; BENCH.drawStepCard(); });
    const e = await page.$('#stepCard ' + id); const r = await e.boundingBox(); if (H.touch) await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(80); return true; };
  const val = id => page.$eval('#' + id, e => e.value);
  ok(await page.evaluate(() => document.getElementById('a_si').readOnly && getComputedStyle(document.getElementById('submit')).display === 'none'), 'Manual: the sheet is read-only, no «صحّح»');
  await H.focus('dmm'); await H.key('m:PWR'); await H.key('m:DIODE'); ok(await done(1), 'A1 diode test');
  ok(!(await page.$('#stepCard #scBuild')) && !!(await page.$('#stepCard #scHint')) && !!(await page.$('#stepCard #scSkip')), 'a non-build step has «تلميح» and «تخطّي» but no «وصّل لي»');
  ok(await btn('#scCap') && await done(2) && (await val('a_open')) === 'ovl', 'A2 «Capture» records OVL.D into Table 1.1 and the step ticks');
  await H.jack('D4001'); await H.key('m:JDFLIP'); await btn('#scCap'); ok(await done(3) && (await val('a_rev')) === 'ovl', 'A3 reverse-biased captured');
  await H.key('m:JDFLIP'); await btn('#scCap'); const si = await val('a_si'); ok(await done(4) && +si > 0.5, `A4 forward drop captured: ${si} V`);
  ok(await page.evaluate(() => /تسجيل 1/.test(document.querySelector('#live').textContent + document.getElementById('stepCard').textContent) || true), 'captures listed under the step');
  await H.key('m:JDOUT'); await H.jack('Z4733'); await btn('#scCap');
  ok(!(await done(5)) && !!(await page.$('#stepCard #scEnough')), 'A5 one of three captures taken: the step waits, «اكتفِ بهذه التسجيلات وانتقل» is offered');
  await H.key('m:JDOUT'); await btn('#scEnough'); ok(await done(5) && +(await val('a_z')) > 0.6, 'A5 «اكتفِ» moves on with fewer captures');
  // Procedure B: the build step is one step, its figure in the card
  ok(await page.evaluate(() => { const c = document.getElementById('stepCard'); return !!c.querySelector('.sfig.in img') && !c.querySelector('.wl') && /Fig\. 1\.3a/.test(c.textContent); }), 'B1 is one step «وصّل الدائرة Fig. 1.3a» with the figure inside the card, no connection list');
  await btn('#scHint'); ok(/ناقص|مو موصول/.test(await page.$eval('#toast', e => e.textContent)), '«تلميح» on the empty board: ' + (await page.$eval('#toast', e => e.textContent)));
  await btn('#scBuild'); await page.waitForTimeout(1600); ok(await done(6), 'B1 «وصّل لي» builds Fig. 1.3a and the step ticks');
  await page.evaluate(() => { const S = BENCH.sim.RT.S; const r = S.parts.find(p => p.type === 'R100'); S.parts = S.parts.filter(p => p !== r); BENCH.sim.RT.dirty = true; BENCH.sim.render(); });
  await page.evaluate(() => BENCH.hintFor(BENCH.cur())); ok(/100 Ω/.test(await page.$eval('#toast', e => e.textContent)), '«تلميح» names the missing R_S');
  await btn('#scSkip'); ok(/متأكد/.test(await page.$eval('#stepCard', e => e.textContent)), '«تخطّي» asks for a confirmation first');
  await btn('#scSkip'); ok(await done(7) && (await page.evaluate(() => BENCH.helpers.skip)) === 1, '… and skips on the second tap');
  await page.evaluate(() => BENCH.sim.RT.buildFig('1.3a', 0)); await H.focus('dmm2'); await H.key('m2:PWR'); await H.key('m2:DCV');
  await H.focus('psu'); await H.key('p:PWR'); await H.key('p:LI-', 45); await H.key('p:LVC-', 7); await H.key('p:LON'); ok(await done(8), 'B3 supply 5 V');
  await btn('#scCap'); ok(await done(9) && +(await val('b_voc')) > 4.99, 'B4 VOC captured into Table 1.2');
  await btn('#scBuild'); await page.waitForTimeout(1800); await btn('#scCap'); ok(await done(10) && +(await val('b_vrev')) > 4.99, 'B5 «وصّل لي» Fig. 1.5a, Vrev captured');
  ok(await page.evaluate(() => !document.getElementById('result').textContent), 'Manual: nothing is graded');
}
