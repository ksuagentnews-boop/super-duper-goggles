/* Mixed Arabic + English: every step (text and build lines) and every sheet of every experiment, rendered the way the
   site shows them, must have each English / technical run isolated (BIDI) — no run left to the bidi algorithm. */
export async function run(page, vp, ok) {
  console.log(`[${vp}] every experiment: bidi in steps and sheets, default layout, overview fit`);
  const ids = await page.evaluate(() => REGISTRY.all().filter(e => e.built).map(e => e.id));
  // figures open full screen and zoom (Exp 1 sheet figure)
  const fv = await page.evaluate(async () => { await REGISTRY.load('ee312/exp1'); document.querySelector('#hall').hidden = true; BENCH.enter('ee312/exp1', 'manual', true); await new Promise(r => setTimeout(r, 200));
    document.querySelector('#paperHost img.figimg').click(); const v = document.getElementById('figView'); const open = !v.hidden && !!v.querySelector('#fvIn img');
    const st = v.querySelector('#fvStage'), r = st.getBoundingClientRect(); st.dispatchEvent(new WheelEvent('wheel', { deltaY: -300, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, bubbles: true, cancelable: true }));
    const zoomed = /scale\((?!1\))/.test(v.querySelector('#fvIn').style.transform); v.querySelector('#fvX').click(); const closed = v.hidden; BENCH.leave(true); return { open, zoomed, closed }; });
  ok(fv.open && fv.zoomed && fv.closed, `a manual figure opens full screen, zooms and closes (${JSON.stringify(fv)})`);
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
      /* the default layout has no crossings; on this viewport the overview is fitted to instruments + board */
      let cross = null, fill = null; if (BENCH.sim.RT && BENCH.sim.RT.crossings) { const x = BENCH.sim.RT.crossings(); cross = x.cc.concat(x.ci);
        const R = BENCH.ovRect, vb = BENCH.vb, st = BENCH.stageSize(), pd = BENCH.pads(); const s = st.W / vb.w; const aw = st.W - pd.left - 2 * Math.min(18, st.W * 0.03), ah = st.H - pd.top - pd.bottom;
        fill = Math.max(R[2] * s / aw, R[3] * s / ah); }
      const n = (BENCH.sim.steps || []).length; BENCH.leave(true); return { n, bad, cross, fill };
    }, id);
    if (r.cross) ok(!r.cross.length, `${id}: default layout without crossings` + (r.cross.length ? ': ' + r.cross.join(', ') : ''));
    if (r.fill != null) ok(r.fill > 0.97, `${id}: overview fitted to instruments + board (${(r.fill * 100).toFixed(0)} % of the free area)`);
    ok(r.bad.length === 0, `${id}: ${r.n} steps + sheet, every English run isolated` + (r.bad.length ? ` — ${r.bad.length} not: ${r.bad.slice(0, 4).join(' | ')}` : ''));
  }
}
