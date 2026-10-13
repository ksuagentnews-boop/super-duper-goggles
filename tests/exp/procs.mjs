import { sit } from '../lib.mjs';
/* Manual mode asks which procedures this term runs: all ticked by default; steps, sheet sections and grading rows of the
   others are left out; a short card marks the move from one procedure to the next */
export async function run(page, vp, ok) {
  console.log(`[${vp}] procedure picker`);
  await page.click('#quickBtn'); await page.click('#quick [data-level="6"]'); await page.click('#quick [data-lab="ee312"]'); await page.click('#quick [data-exp="ee312/exp9"]');
  await page.waitForSelector('#seatModal:not([hidden])', { timeout: 8000 }); await page.click('#seatModal button[data-mode="manual"]');
  await page.waitForSelector('#procPick:not([hidden])', { timeout: 8000 });
  const pk = await page.evaluate(() => ({ items: [...document.querySelectorAll('#ppList input')].map(i => i.value + (i.checked ? '✓' : '')), note: document.querySelector('#procPick .pp-note').textContent,
    fits: (() => { const r = document.querySelector('#procPick .pp-card').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; })() }));
  ok(pk.items.join() === 'A✓,B✓' && pk.note === 'بعض الـ Procedures ممكن تكون محذوفة في ترمك، تأكد من دكتور المعمل واختر اللي مطلوبة منك' && pk.fits, `Exp 9 Manual: the picker lists Procedure A and B, both ticked, with the note, on screen (${pk.items})`);
  await page.evaluate(() => document.querySelectorAll('#ppList input').forEach(i => { i.checked = false; i.dispatchEvent(new Event('change', { bubbles: true })); }));
  ok(await page.$eval('#ppGo', b => b.disabled), 'nothing ticked: ابدأ is disabled');
  await page.click('#ppList input[value="B"]'); await page.click('#ppGo'); await page.waitForTimeout(200);
  const b = await page.evaluate(() => { const S = BENCH.sim.steps, ph = document.getElementById('paperHost'); const vis = id => { const e = document.getElementById(id); return !!e && !!e.offsetParent; };
    return { procs: [...new Set(S.map(s => s.proc))].join(), first: S[0].t.slice(0, 12), card: document.querySelector('#stepCard .k').textContent, a: vis('vbe0'), d: vis('d_rc'), plqB: vis('q6rc'), plqA: vis('q3'),
      plug: S.some(s => (s.lines || []).some(l => l.jack === 'Lp')) }; });
  ok(b.procs === 'B' && b.first.startsWith('Procedure B') && /Procedure B · الخطوة 1 من \d+/.test(b.card), `only B: the steps start at Procedure B and count within it (${b.card})`);
  ok(!b.a && !b.plqA && b.d && b.plqB, 'only B: Table 9.2 and the Procedure A PLQs are hidden, the design and PLQ 6 are shown');
  ok(b.plug, 'only B: the supply lead gets its plug-in line in Procedure B (its first use now)');
  const grade = async sel => page.evaluate(async sel => { BENCH.procSel = new Set(sel); BENCH.applyProcs(); document.getElementById('submit').click(); await new Promise(r => setTimeout(r, 50));
    return [...document.querySelectorAll('#result .good, #result .bad')].map(e => e.querySelector('.m').textContent); }, sel);
  const all = await grade(['A', 'B']), onlyA = await grade(['A']), onlyB = await grade(['B']);
  ok(onlyA.length < all.length && onlyB.length < all.length && !onlyB.some(t => t.startsWith('Table 9.2')) && !onlyA.some(t => /^B\d? /.test(t)) && onlyA.length + onlyB.length === all.length,
    `grading counts only the picked procedures: A ${onlyA.length} + B ${onlyB.length} rows = all ${all.length}`);
  // two procedures: when the last step of A ticks, a short card announces Procedure B
  await page.evaluate(() => { BENCH.procSel = new Set(['A', 'B']); BENCH.applyProcs(); const S = BENCH.sim.steps, k = S.findIndex(s => s.proc === 'B'); S.forEach((s, i) => { s.ok = () => i < k; }); BENCH.onRender(); });
  const pn = await page.evaluate(() => { const e = document.getElementById('procNext'); return { shown: !e.hidden, t: e.textContent }; });
  ok(pn.shown && pn.t === 'خلصت Procedure A ← ننتقل لـ Procedure B', `after Procedure A: "${pn.t}"`);
  // Free mode never asks
  await page.click('#bSwitch'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => BENCH.mode === 'free' && document.getElementById('procPick').hidden), 'Free mode: no picker');
}
