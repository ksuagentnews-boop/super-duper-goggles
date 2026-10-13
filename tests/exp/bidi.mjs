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
        const R = BENCH.ovRect, vb = BENCH.vb, st = BENCH.stageSize(), pd = BENCH.pads(); const s = st.W / vb.w; const aw = st.W - pd.left - (pd.right || 0) - 2 * Math.min(12, st.W * 0.015), ah = st.H - pd.top - pd.bottom;
        fill = Math.max(R[2] * 1.04 * s / aw, R[3] * 1.04 * s / ah); }
      /* nothing on the desk sits under the parts box, the bench tools, the hint, the zoom chip or the step card, or off the stage */
      let ovl = null; if (BENCH.sim.RT && !BENCH.sim.pc && BENCH.svg) { await new Promise(r => setTimeout(r, 120)); const B = BENCH, m = B.svg.getScreenCTM(); const scr = r => ({ x: r[0] * m.a + m.e, y: r[1] * m.d + m.f, w: r[2] * m.a, h: r[3] * m.d });
        const R = B.sim.regions, L = B.sim.RT.layout; const items = Object.keys(R).filter(k => k !== 'board').map(k => [k, scr(R[k])]); items.push(['board', scr(B.sim.boardRect)]); if (L.TRAY.on) items.push(['tray', scr([L.TRAY.x, L.TRAY.y, L.TRAY.w, L.TRAY.h])]);
        const vis = e => e && !e.hidden && getComputedStyle(e).display !== 'none' && +getComputedStyle(e).opacity > 0.05;
        const obs = [['parts box', document.getElementById('drawer')], ['hint', document.getElementById('ovHint')], ['step card', document.getElementById('stepCard')], ['zoom chip', document.getElementById('zoomUI')], ...[...document.querySelectorAll('#benchView .btools > *')].map(e => ['tool', e])]
          .filter(([, e]) => vis(e)).map(([n, e]) => { const r = e.getBoundingClientRect(); return [n, r]; }).filter(([, r]) => r.width > 0 && r.height > 0);
        const st = document.getElementById('bstage').getBoundingClientRect(); ovl = [];
        for (const [k, a] of items) { for (const [n, b] of obs) { const ix = Math.min(a.x + a.w, b.x + b.width) - Math.max(a.x, b.x), iy = Math.min(a.y + a.h, b.y + b.height) - Math.max(a.y, b.y); if (ix > 4 && iy > 4) ovl.push(`${k} under ${n}`); }
          if (a.x < st.left - 2 || a.y < st.top - 2 || a.x + a.w > st.right + 2 || a.y + a.h > st.bottom + 2) ovl.push(`${k} off the stage`); } }
      const n = (BENCH.sim.steps || []).length; BENCH.leave(true); return { n, bad, cross, fill, ovl };
    }, id);
    if (r.cross) ok(!r.cross.length, `${id}: default layout without crossings` + (r.cross.length ? ': ' + r.cross.join(', ') : ''));
    if (r.ovl) ok(!r.ovl.length, `${id}: nothing on the desk under the parts box, tools, hint or step card` + (r.ovl.length ? ': ' + [...new Set(r.ovl)].join(', ') : ''));
    if (r.fill != null) ok(r.fill > 0.97, `${id}: overview fitted to instruments + board with a ≈4 % margin (${(r.fill * 100).toFixed(0)} % of the visible free area)`);
    ok(r.bad.length === 0, `${id}: ${r.n} steps + sheet, every English run isolated` + (r.bad.length ? ` — ${r.bad.length} not: ${r.bad.slice(0, 4).join(' | ')}` : ''));
  }
}
