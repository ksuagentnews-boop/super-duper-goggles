import { sit } from '../lib.mjs';
/* Batch 8 item 3: every helper works on every sub-step of every experiment (Manual). From the overview, «وريني وين» must move
   the view to a device / the board or light something; «تلميح» must show a non-empty message; the sub-step's "do it for me"
   («وصّل لي» / «قِس لي» / «اضبط لي» / «سجّل لي») must tick it (or take a capture). Lists every sub-step where one does nothing.
   HELP_EXPS=ee312/exp3,… limits the list. */
const EXPS = process.env.HELP_EXPS ? process.env.HELP_EXPS.split(',') : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => 'ee312/exp' + n).concat([1, 2, 3, 4, 5, 6, 7, 8].map(n => 'ee205/exp' + n));
export async function run(page, vp, ok) {
  for (const exp of EXPS) {
    await page.goto('http://app.local/'); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 });
    if (await page.$eval('#welcome', e => !e.hidden)) await page.click('#wlStart');
    await sit(page, exp, 'manual');
    await page.evaluate(() => { BENCH.fast = true; });
    const bad = [], seen = new Set(); let same = 0, last = '';
    for (let i = 0; i < 700; i++) {
      const s = await page.evaluate(() => { const S = BENCH.sim.steps, c = BENCH.cur(), card = document.getElementById('stepCard');
        return { n: S.length, c, sub: ((card.querySelector('.subs li.cur .lt') || {}).textContent || '').trim(), ok: card.querySelectorAll('.subs li.ok').length, caps: card.querySelectorAll('.capi').length, chk: !!card.querySelector('#scChk'), pc: !!BENCH.sim.pc }; });
      if (s.c >= s.n) break;
      const key = `${s.c}|${s.ok}|${s.caps}`; if (key === last) { if (++same >= 4) { bad.push(`step ${s.c + 1} «${s.sub}»: stuck`); break; } } else { same = 0; last = key; }
      if (s.chk) { await page.evaluate(() => document.querySelector('#stepCard #scChk').click()); await page.waitForTimeout(40); continue; }
      const id = `${s.c}|${s.ok}`;
      if (!seen.has(id)) { seen.add(id); const w = `step ${s.c + 1} «${s.sub.slice(0, 50)}»`;
        /* «وريني وين» from the overview (the PC tables have no devices to move to: there it must not throw) */
        const go = await page.evaluate(async pc => { const c = document.getElementById('stepCard'), b = c.querySelector('#scGo'); if (!b) return 'no button';
          if (BENCH.view !== 'ov' && BENCH.back) BENCH.back(); await new Promise(r => setTimeout(r, 60)); const v0 = BENCH.view; b.click(); await new Promise(r => setTimeout(r, 120));
          const lit = !!document.querySelector('#Lguide *, #LguideB *');
          return pc || BENCH.view !== v0 || lit ? '' : 'nothing'; }, s.pc);
        if (go) bad.push(`${w}: «وريني وين» ${go}`);
        const hint = await page.evaluate(async () => { const c = document.getElementById('stepCard'), b = c.querySelector('#scHint'); if (!b) return 'no button';
          const t = document.getElementById('toast'); t.textContent = ''; b.click(); await new Promise(r => setTimeout(r, 60)); return t.textContent.trim().length > 3 ? '' : 'empty'; });
        if (hint) bad.push(`${w}: «تلميح» ${hint}`); }
      const did = await page.evaluate(() => { const c = document.getElementById('stepCard'), b = c.querySelector('#scBuild') || c.querySelector('#scDo') || c.querySelector('#scCap'); if (!b) return false; b.click(); return true; });
      if (!did) { bad.push(`step ${s.c + 1} «${s.sub}»: no "do it for me"`); break; }
      await page.waitForFunction(() => !BENCH._doing, null, { timeout: 60000 }); await page.waitForTimeout(40);
      const after = await page.evaluate(() => { const c = document.getElementById('stepCard'); return { c: BENCH.cur(), ok: c.querySelectorAll('.subs li.ok').length, caps: c.querySelectorAll('.capi').length }; });
      if (after.c === s.c && after.ok === s.ok && after.caps === s.caps) bad.push(`step ${s.c + 1} «${s.sub.slice(0, 50)}»: "do it for me" did not tick it`);
    }
    ok(!bad.length, `${exp}: every helper works on every sub-step` + (bad.length ? ` · ${bad.length}: ` + [...new Set(bad)].slice(0, 14).join(' | ') : ''));
  }
}
