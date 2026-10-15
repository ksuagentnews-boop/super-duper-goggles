import { sit } from '../lib.mjs';
/* Batch 7 item 3: a student can go through a whole procedure only by pressing "do it for me". For every experiment, in
   Manual mode: press the current sub-step's «وصّل لي» / «قِس لي» / «اضبط لي» / «سجّل لي» (and the instructor check of the
   mains tables when the card asks for it) until every step is done; nothing else is touched. Fails with the step and
   sub-step it got stuck on. DOALL_EXPS=ee312/exp1,… limits the list. */
const EXPS = process.env.DOALL_EXPS ? process.env.DOALL_EXPS.split(',') : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => 'ee312/exp' + n).concat([1, 2, 3, 4, 5, 6, 7, 8].map(n => 'ee205/exp' + n));
export async function run(page, vp, ok) {
  for (const exp of EXPS) {
    await page.goto('http://app.local/'); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 });
    if (await page.$eval('#welcome', e => !e.hidden)) await page.click('#wlStart');
    await sit(page, exp, 'manual');
    await page.evaluate(() => { BENCH.fast = true; });          // the same actions, without the animation delays
    const t0 = Date.now(); let last = -1, same = 0, stuck = null, presses = 0;
    for (let i = 0; i < 600; i++) {
      const s = await page.evaluate(() => { const S = BENCH.sim.steps, c = BENCH.cur(); const card = document.getElementById('stepCard');
        return { n: S.length, c, sub: (card.querySelector('.subs li.cur .lt') || {}).textContent || '', subs: card.querySelectorAll('.subs li.ok').length, chk: !!card.querySelector('#scChk'), caps: card.querySelectorAll('.capi').length }; });
      if (s.c >= s.n) break;
      const key = s.c * 1e6 + s.subs * 1000 + s.caps; if (key === last) same++; else { same = 0; last = key; }
      if (same >= 4) { stuck = `step ${s.c + 1} / ${s.n}, sub-step «${s.sub.trim()}» · ${await page.$eval('#toast', e => e.textContent)}`; break; }
      const sel = s.chk ? '#scChk' : null;
      await page.evaluate(sel => { const c = document.getElementById('stepCard'); if (sel) { c.querySelector(sel).click(); return; }
        const b = c.querySelector('#scBuild') || c.querySelector('#scDo') || c.querySelector('#scCap'); if (b) b.click(); }, sel);
      presses++;
      await page.waitForFunction(() => !BENCH._doing, null, { timeout: 60000 }); await page.waitForTimeout(40);
    }
    const fin = await page.evaluate(() => ({ n: BENCH.sim.steps.length, done: BENCH.done.filter(Boolean).length, skip: BENCH.sim.steps.filter(s => s.skipped).length }));
    ok(!stuck && fin.done === fin.n && !fin.skip, `${exp}: every Manual step done by "do it for me" only (${fin.done} / ${fin.n} steps, ${presses} presses, ${((Date.now() - t0) / 1000).toFixed(0)} s)` + (stuck ? ' · stuck at ' + stuck : ''));
  }
}
