/* Mixed Arabic + English: every step (text and build lines) and every sheet of every experiment, rendered the way the
   site shows them, must have each English / technical run isolated (BIDI) — no run left to the bidi algorithm. */
export async function run(page, vp, ok) {
  console.log(`[${vp}] bidi: steps and sheets`);
  const ids = await page.evaluate(() => REGISTRY.all().filter(e => e.built).map(e => e.id));
  for (const id of ids) {
    const r = await page.evaluate(async id => {
      await REGISTRY.load(id); document.querySelector('#hall').hidden = true; BENCH.enter(id, 'manual', true);
      await new Promise(r => setTimeout(r, 250));
      const box = document.createElement('div'); box.dir = 'rtl'; box.style.cssText = 'position:fixed;left:-9999px;top:0;width:600px'; document.body.appendChild(box);
      const bad = [];
      (BENCH.sim.steps || []).forEach((s, i) => { box.innerHTML = `<div class="t">${s.t}</div>` + (s.lines || []).map(l => `<div>${l.t}</div>`).join(''); BIDI.fix(box); BIDI.leaks(box).forEach(t => bad.push(`step ${i + 1}: ${t}`)); });
      box.remove();
      BIDI.leaks(document.getElementById('paperHost')).forEach(t => bad.push('sheet: ' + t));
      BIDI.leaks(document.getElementById('stepCard')).forEach(t => bad.push('card: ' + t));
      const n = (BENCH.sim.steps || []).length; BENCH.leave(true); return { n, bad };
    }, id);
    ok(r.bad.length === 0, `${id}: ${r.n} steps + sheet, every English run isolated` + (r.bad.length ? ` — ${r.bad.length} not: ${r.bad.slice(0, 4).join(' | ')}` : ''));
  }
}
