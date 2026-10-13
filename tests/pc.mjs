// Helpers that drive the LTspice-style PC app through its UI (buttons, dialogs, clicks on the schematic grid).
export function pcDriver(page, touch) {
  const P = {
    tapSel: async sel => { const b = await page.$(sel); if (!b) throw new Error('no ' + sel); await b.scrollIntoViewIfNeeded(); const r = await b.boundingBox(); const x = r.x + r.width / 2, y = r.y + r.height / 2;
      if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await page.waitForTimeout(30); },
    act: k => P.tapSel(`#pcTools [data-pc="${k}"]`),
    tool: () => page.evaluate(() => [BENCH.sim.RT.S.tool, BENCH.sim.RT.S.ptool]),
    xy: (gx, gy) => page.evaluate(([gx, gy]) => BENCH.sim.RT.client(gx, gy), [gx, gy]),
    /* narrow screens: pan the schematic to a grid point that is out of view, as a student would */
    show: async (gx, gy) => { if (!(await P.vis(gx, gy))) await page.evaluate(([gx, gy]) => {
        const RT = BENCH.sim.RT, r = document.getElementById('pcSch').getBoundingClientRect(), d = RT.client(gx + 1, gy)[0] - RT.client(gx, gy)[0], v = RT.S.view;
        v.x = gx - r.width / 2 / d; v.y = gy - r.height / 2 / d; BENCH.sim.render(); }, [gx, gy]); },
    at: async (gx, gy) => { await P.show(gx, gy);
      const [x, y] = await P.xy(gx, gy); const inSch = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return !!(e && e.closest('#pcSch')); }, [x, y]);
      if (!inSch) throw new Error(`grid point ${gx},${gy} is not on the visible schematic`); if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await page.waitForTimeout(25); },
    vis: async (gx, gy) => { const [x, y] = await P.xy(gx, gy); return page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return !!(e && e.closest('#pcSch')); }, [x, y]); },
    view: (x, y, s) => page.evaluate(([x, y, s]) => { BENCH.sim.RT.S.view = { x, y, s }; BENCH.sim.render(); }, [x, y, s]),
    sel: async () => { const [t] = await P.tool(); if (t === 'sel') return; const [, p] = await P.tool(); await P.act(t === 'place' ? (['V', 'OA', 'NM', 'PM'].includes(p) ? null : p) || 'wire' : t); if ((await P.tool())[0] !== 'sel') await page.evaluate(() => { BENCH.sim.RT.S.tool = 'sel'; BENCH.sim.render(); }); },
    /* place a part: type R C L D GND (toolbar) or V / OA:OP747 / NM / PM (Component dialog); rot = Ctrl+R presses before the click */
    place: async (type, gx, gy, rot = 0) => { if (['V', 'NM', 'PM'].includes(type) || type.startsWith('OA:')) { await P.act('comp'); await P.tapSel(`#pcDlg [data-cp="${type === 'V' ? 'voltage' : type}"]`); } else if ((await P.tool()).join() !== 'place,' + type) await P.act(type);
      for (let i = 0; i < 4 && (await page.evaluate(() => BENCH.sim.RT.S.prot)) !== rot; i++) await P.act('rot'); await P.at(gx, gy); },
    wire: async (...pts) => { if ((await P.tool())[0] !== 'wire') await P.act('wire'); for (let i = 0; i + 1 < pts.length; i += 2) { await P.at(...pts[i]); await P.at(...pts[i + 1]); } },
    label: async (name, gx, gy) => { await P.sel(); await P.act('label'); await page.fill('#pcIn', name); await P.tapSel('#pcDlg [data-dl="ok"]'); await P.at(gx, gy); },
    dir: async (text, gx, gy) => { await P.sel(); await P.act('dir'); await page.fill('#pcIn', text); await P.tapSel('#pcDlg [data-dl="ok"]'); await P.at(gx, gy); },
    center: async name => { const g = await page.evaluate(n => { const RT = BENCH.sim.RT; const c = RT.S.comps.find(q => q.name === n); const ps = RT.pinsOf(c); return [ps.reduce((a, p) => a + p[0], 0) / ps.length, ps.reduce((a, p) => a + p[1], 0) / ps.length]; }, name);
      await P.show(g[0], g[1]); return P.xy(g[0], g[1]); },
    rclick: async name => { await P.sel(); const [x, y] = await P.center(name); await page.mouse.click(x, y, { button: 'right' }); await page.waitForTimeout(40); },
    value: async (name, v) => { await P.rclick(name); await page.fill('#pcIn', v); await P.tapSel('#pcDlg [data-dl="ok"]'); },
    diode: async (name, m) => { await P.rclick(name); await P.tapSel(`#pcDlg [data-dm="${m}"]`); },
    source: async (name, kind, args) => { await P.rclick(name); if (kind !== 'DC') { await P.tapSel(`#pcDlg [data-src="${kind}"]`); const ins = await page.$$('#pcDlg [data-ai]'); for (let i = 0; i < args.length; i++) await ins[i].fill(String(args[i])); } else { await P.tapSel('#pcDlg [data-src="DC"]'); await page.fill('#pcIn', String(args)); } await P.tapSel('#pcDlg [data-dl="ok"]'); },
    mos: async (name, model) => { await P.rclick(name); await page.fill('#pcIn', model); await P.tapSel('#pcDlg [data-dl="ok"]'); },
    tran: async (stop, start, max) => { await P.sel(); await P.act('ana'); await P.tapSel('#pcDlg [data-tab="tran"]'); await page.fill('#aStop', stop); await page.fill('#aStart', start); await page.fill('#aMax', max); await P.tapSel('#pcDlg [data-dl="ok"]'); },
    dc: async (src, a, b, inc) => { await P.sel(); await P.act('ana'); await P.tapSel('#pcDlg [data-tab="dc"]'); await page.fill('#aSrc', src); await page.fill('#aFrom', a); await page.fill('#aTo', b); await page.fill('#aInc', inc); await P.tapSel('#pcDlg [data-dl="ok"]'); },
    run: async () => { await P.sel(); await P.act('run'); await page.waitForTimeout(80); const e = await page.evaluate(() => BENCH.sim.RT.S.err); if (e) throw new Error('LTspice: ' + e); },
    probe: async (gx, gy) => { await P.sel(); await P.at(gx, gy); },
    probeI: async name => { await P.sel(); const [x, y] = await P.center(name); if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await page.waitForTimeout(30); },
    probe2: async (a, b) => { await P.sel(); if (!(await P.vis(...a)) || !(await P.vis(...b))) await page.evaluate(([a, b]) => { /* both ends in view: centre and zoom out if needed */
        const RT = BENCH.sim.RT, r = document.getElementById('pcSch').getBoundingClientRect(), v = RT.S.view, U = (RT.client(a[0] + 1, a[1])[0] - RT.client(a[0], a[1])[0]) / v.s;
        v.s = Math.min(v.s, 0.8 * r.width / (Math.abs(a[0] - b[0]) * U + 1), 0.8 * r.height / (Math.abs(a[1] - b[1]) * U + 1)); const d = U * v.s;
        v.x = (a[0] + b[0]) / 2 - r.width / 2 / d; v.y = (a[1] + b[1]) / 2 - r.height / 2 / d; BENCH.sim.render(); }, [a, b]);
      const [x0, y0] = await P.xy(...a), [x1, y1] = await P.xy(...b); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(40); },
    traces: () => page.evaluate(() => BENCH.sim.RT.S.traces.map(t => t.expr)),
    delTrace: e => P.tapSel(`#pcWave [data-trx="${e}"]`),
    avgOf: e => P.tapSel(`#pcWave [data-tra="${e}"]`),
    fitW: () => P.tapSel('#pcWave [data-wfit]'),
    zoomW: async (f0, f1) => { const b = await (await page.$('#pcWsvg')).boundingBox(); const ax = await page.evaluate(() => BENCH.sim.RT.S._ax); const x0 = b.x + ax.L + ax.pw * f0, x1 = b.x + ax.L + ax.pw * f1, y = b.y + ax.T + ax.ph / 2;
      await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move(x1, y + 3, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(40); },
    /* value readouts the student would take from the plot (pointer readout / average box) */
    peak: (e, from = 0, neg = false) => page.evaluate(([e, from, neg]) => { const RT = BENCH.sim.RT, R = RT.S.res; const v = RT.evalOn(R, e)[0], xs = R.runs[0].xs; let m = neg ? 1e9 : -1e9; v.forEach((y, k) => { if (xs[k] >= from) m = neg ? Math.min(m, y) : Math.max(m, y); }); return m; }, [e, from, neg]),
    avgVal: () => page.evaluate(() => BENCH.sim.RT.S.avgVal),
  };
  return P;
}
