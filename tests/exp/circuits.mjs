/* Batch 6 item 1 — a circuit counts when it works, however it is laid out. For every figure of every bench experiment
   (def.figs): (1) the reference layout («وصّل لي») matches; (2) a second, different layout matches: every part on its own
   fresh pair of nodes elsewhere on the panel, joined to its nets by wires, the leads on other nodes of the same nets;
   (3) wrong circuits do not: a part missing, a polar part reversed, an ammeter shorted across (parallel instead of series),
   two nets shorted together. */
import { sit } from '../lib.mjs';
const EXPS = (process.env.CIRC_EXPS ? process.env.CIRC_EXPS.split(',') : [1, 2, 3, 4, 5, 7, 9, 10].map(n => 'ee312/exp' + n).concat([1, 2, 3, 4, 5, 6, 7, 8].map(n => 'ee205/exp' + n)));
export async function run(page, vp, ok) {
  for (const exp of EXPS) {
    await page.goto('http://app.local/'); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 });
    if (await page.$eval('#welcome', e => !e.hidden)) await page.click('#wlStart');
    await sit(page, exp, 'free');
    const res = await page.evaluate(async () => { const RT = BENCH.sim.RT, L = RT.layout, out = [];
      for (const [id, F] of Object.entries(RT.figs || {})) { const r = { id };
        await RT.buildFig(id, 0); r.ref = RT.match(id).ok;
        /* layout 2: rebuild from the matched reference, every part moved to fresh nodes and wired back */
        const S = RT.S; const BB = L.BB;
        if (!BB) { const used = new Set(); S.parts.forEach(p => (p.n != null ? [] : [p.a, p.b]).forEach(n => used.add(n))); S.wires.forEach(w => { used.add(w.a); used.add(w.b); });
          S.pl.forEach(P => P.clips.forEach(c => { if (c.bn != null) used.add(c.bn); }));
          const NN = L.COLS * L.ROWS; const free = []; for (let n = NN - 1; n >= 0; n--) if (!used.has(n)) free.push(n);
          const takePair = () => { for (let i = 0; i < free.length; i++) for (let j = 0; j < free.length; j++) { const a = free[i], b = free[j]; if (a !== b && (b === a + 1 && Math.floor(a / L.COLS) === Math.floor(b / L.COLS) || b === a + L.COLS)) { free.splice(Math.max(i, j), 1); free.splice(Math.min(i, j), 1); return [a, b]; } } return null; };
          let moved = 0, holes = 0;
          for (const p of S.parts.filter(p => p.n == null && RT.PARTS[p.type].t !== 'BR')) { const pr = takePair(); if (!pr) break;
            /* the hole a wire uses does not change the netlist */
            const ha = 1, hb = 7;
            S.wires.push({ id: RT.uid++, a: pr[0], ha: 0, b: p.a, hb: ha }); S.wires.push({ id: RT.uid++, a: pr[1], ha: 0, b: p.b, hb: hb }); p.a = pr[0]; p.b = pr[1]; moved++; }
          RT.dirty = true; r.moved = moved; r.layout2 = RT.match(id).ok; }
        else { r.bb = 1; r.moved = 0; r.layout2 = r.ref; }
        /* wrong circuits */
        await RT.buildFig(id, 0);
        const parts = RT.S.parts.filter(p => RT.PARTS[p.type].t !== 'BR');
        if (parts.length) { const keep = RT.S.parts; RT.S.parts = keep.filter(p => p !== parts[parts.length - 1]); RT.dirty = true; r.missing = !RT.match(id).ok; RT.S.parts = keep; RT.dirty = true; }
        const pol = parts.find(p => p.n == null && ['D', 'Z', 'LED', 'GE'].includes(RT.PARTS[p.type].t) || (RT.PARTS[p.type].t === 'C' && !RT.PARTS[p.type].np && p.n == null));
        if (pol) { const sw = () => { [pol.a, pol.b] = [pol.b, pol.a]; if (pol.ha != null) [pol.ha, pol.hb] = [pol.hb, pol.ha]; RT.dirty = true; }; sw(); r.reversed = !RT.match(id).ok; sw(); }
        /* an ammeter (a current-jack lead in the figure) shorted across: parallel instead of in series */
        const amm = (F.lines || []).find(l => l.lead && RT.inst && /^h\d+(ma|a)$|^w\d+i$/.test(l.lead));
        if (amm) { const k = amm.lead, other = (F.lines || []).find(l => l.lead && l.lead !== k && l.lead.replace(/\d+.*/, '') === k.replace(/\d+.*/, '') && /c$/.test(l.lead) && l.lead.slice(0, -1) === k.replace(/(ma|a|i)$/, ''));
          if (other) { RT.S.wires.push({ id: RT.uid++, a: amm.at, ha: 4, b: other.at, hb: 4, tmp: 1 }); RT.dirty = true; r.ammParallel = !RT.match(id).ok; RT.S.wires = RT.S.wires.filter(w => !w.tmp); RT.dirty = true; } }
        /* two nets shorted */
        if (parts.length && !BB) { const p = parts[0]; RT.S.wires.push({ id: RT.uid++, a: p.a, ha: 4, b: p.b, hb: 4, tmp: 1 }); RT.dirty = true; r.short = !RT.match(id).ok; RT.S.wires = RT.S.wires.filter(w => !w.tmp); RT.dirty = true; }
        out.push(r); }
      return out; });
    const bad = res.filter(r => !r.ref || !r.layout2 || (!r.bb && !r.moved) || r.missing === false || r.reversed === false || r.ammParallel === false || r.short === false);
    ok(res.length && !bad.length, `${exp}: ${res.length} figure(s) — reference and a second layout match, wrong circuits (missing part, reversed part, ammeter in parallel, short) fail` + (bad.length ? ' · ' + JSON.stringify(bad) : ''));
  }
}
