import { sit, bench } from '../lib.mjs';
/* Manual mode on EE312 Exp 1 (Batch 6 items 2, 4, 5; Batch 7 item 3): the step card sits in the right-hand column; every
   manual step is split into its sub-steps, each ticks green with ✓ when it is done and has its own "do it for me"
   («وصّل لي» / «قِس لي» / «اضبط لي» / «سجّل لي») and «تلميح»; a whole procedure can be done by "do it for me" only;
   «Capture» records readings under the sub-step and into the sheet (read-only, no grading); «اكتفِ بهذه التسجيلات
   وانتقل» moves on with fewer; «تخطّي» skips after a confirmation. */
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp1', 'manual');
  const H = bench(page); H.touch = vp !== 'desktop';
  const done = async n => (await H.steps()).done >= n;
  const btn = async sel => { const b = await page.$('#stepCard ' + sel); if (!b) return false; await b.evaluate(e => e.scrollIntoView({ block: 'nearest' }));
    if (await page.$eval('#stepCard', e => e.classList.contains('min'))) await page.evaluate(() => { const c = document.getElementById('stepCard'); c.classList.remove('min'); c.dataset.key = ''; BENCH.drawStepCard(); });
    const e = await page.$('#stepCard ' + sel); const r = await e.boundingBox(); if (H.touch) await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(80); return true; };
  /* press the current sub-step's "do it for me" and wait until it has played */
  const doIt = async () => { const ok1 = await btn('#scBuild') || await btn('#scDo') || await btn('#scCap'); await page.waitForFunction(() => !BENCH._doing, null, { timeout: 30000 }); await page.waitForTimeout(60); return ok1; };
  const card = () => page.evaluate(() => { const c = document.getElementById('stepCard'); return { subs: c.querySelectorAll('.subs li').length, ok: c.querySelectorAll('.subs li.ok').length, cur: (c.querySelector('.subs li.cur .lt') || {}).textContent || '', inPanel: c.classList.contains('in-panel'), inStage: c.classList.contains('in-stage'), text: c.textContent }; });
  const val = id => page.$eval('#' + id, e => e.value);
  ok(await page.evaluate(() => document.getElementById('a_si').readOnly && getComputedStyle(document.getElementById('submit')).display === 'none'), 'Manual: the sheet is read-only, no «صحّح»');
  { const c = await card(); const r = await page.$eval('#stepCard', e => { const b = e.getBoundingClientRect(); return { right: innerWidth - b.right, left: b.left, W: innerWidth }; });
    ok((c.inPanel || c.inStage) && r.right < 40 && r.left > r.W * 0.4, `the step card is in the right-hand column (${c.inPanel ? 'manual page' : 'docked on the bench'})`); }
  { const c = await card(); ok(c.subs === 2 && c.ok === 0 && /POWER/.test(c.cur), `A1 split into its sub-steps: ${c.subs}, current «${c.cur}»`);
    ok(await page.evaluate(() => [...document.querySelectorAll('#stepCard .subs li')].every(li => li.querySelector('[data-do]') && li.querySelector('[data-hint]'))), 'every sub-step has its own "do it for me" and «تلميح»'); }
  await H.focus('dmm'); await H.key('m:PWR');
  { const c = await card(); ok(c.ok === 1 && /diode-test/.test(c.cur), 'a sub-step done on the bench turns green with ✓ and the next one becomes current'); }
  await btn('#scHint'); ok(/▶\|/.test(await page.$eval('#toast', e => e.textContent)), '«تلميح» of the sub-step says what is missing: ' + (await page.$eval('#toast', e => e.textContent)));
  /* the "do it for me" plays on the bench: the key is pressed on the instrument */
  ok(await btn('#scDo') && await page.waitForFunction(() => !BENCH._doing).then(() => true) && await done(1) && (await page.evaluate(() => BENCH.sim.RT.S.dmm.fn)) === 'DIODE' && (await page.evaluate(() => BENCH.helpers.do)) === 1,
    '«اضبط لي» turns the DMM to ▶| itself, the sub-step and the step tick');
  /* A2 … A4 by "do it for me" only */
  for (let i = 0; i < 12 && !(await done(4)); i++) await doIt();
  ok(await done(4) && (await val('a_open')) === 'ovl' && (await val('a_rev')) === 'ovl' && +(await val('a_si')) > 0.5, `A2–A4 done by "do it for me" only: OVL.D, OVL.D, ${await val('a_si')} V`);
  // A5: three diodes then the captures; one capture, then «اكتفِ»
  for (let i = 0; i < 6; i++) { const c = await card(); if (/سجّل/.test(c.cur)) break; await doIt(); }
  await btn('#scCap'); ok(!(await done(5)) && !!(await page.$('#stepCard #scEnough')) && /تسجيل 1/.test((await card()).text), 'A5 one of three captures taken: listed under the sub-step, «اكتفِ بهذه التسجيلات وانتقل» is offered');
  await btn('#scEnough'); ok(await done(5) && +(await val('a_z')) > 0.6, 'A5 «اكتفِ» moves on with fewer captures');
  // Procedure B: the build sub-step with its figure in the card
  ok(await page.evaluate(() => { const c = document.getElementById('stepCard'); return !!c.querySelector('.sfig.in img') && /Fig\. 1\.3a/.test(c.textContent) && !!c.querySelector('#scBuild'); }), 'B1: the figure inside the card, the sub-step «وصّل الدائرة Fig. 1.3a» with «وصّل لي»');
  await btn('#scHint'); ok(/ناقص|مو موصول/.test(await page.$eval('#toast', e => e.textContent)), '«تلميح» on the empty board: ' + (await page.$eval('#toast', e => e.textContent)));
  await doIt(); ok(await done(6), 'B1 «وصّل لي» builds Fig. 1.3a and the step ticks');
  await page.evaluate(() => { const S = BENCH.sim.RT.S; const r = S.parts.find(p => p.type === 'R100'); S.parts = S.parts.filter(p => p !== r); BENCH.sim.RT.dirty = true; BENCH.sim.render(); });
  await page.evaluate(() => BENCH.hintFor(BENCH.cur())); ok(/100 Ω/.test(await page.$eval('#toast', e => e.textContent)), '«تلميح» names the missing R_S');
  await btn('#scSkip'); ok(/متأكد/.test(await page.$eval('#stepCard', e => e.textContent)), '«تخطّي» asks for a confirmation first');
  await btn('#scSkip'); ok(await done(7) && (await page.evaluate(() => BENCH.helpers.skip)) === 1, '… and skips on the second tap');
  await page.evaluate(() => BENCH.sim.RT.buildFig('1.3a', 0)); await H.focus('dmm2'); await H.key('m2:PWR'); await H.key('m2:DCV');   /* what the skipped B2 asked */
  /* the rest of Procedure B by "do it for me" only: the supply's knobs turn, the figures build, the readings are captured */
  for (let i = 0; i < 60 && !(await done(16)); i++) await doIt();
  ok(await done(16), `Procedure B done by "do it for me" only (${(await H.steps()).done} / 16 steps)`);
  ok(+(await val('b_voc')) > 4.99 && +(await val('b_vd1')) > 0.4 && +(await val('b_vd20')) > +(await val('b_vd1')) && +(await val('b_vdl')) > 0.5,
    `Table 1.2 filled from the captures: VOC ${await val('b_voc')} V, VD ${await val('b_vd1')} / ${await val('b_vd10')} / ${await val('b_vd20')} V, VD′ ${await val('b_vdl')} V`);
  ok(await page.evaluate(() => !document.getElementById('result').textContent), 'Manual: nothing is graded');
}
