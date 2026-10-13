import { sit, bench } from '../lib.mjs';
/* the wire colour tool with real taps: pick a colour, tap a wire / bridging plug; a colour picked first goes to the next wire;
   instrument leads keep their colours (toast) */
export async function run(page, vp, ok) {
  console.log(`[${vp}] wire colour tool`);
  await sit(page, 'ee312/exp9', 'free');
  const H = bench(page); H.touch = vp !== 'desktop';
  const tapEl = async c => { if (H.touch) await page.touchscreen.tap(c[0], c[1]); else await page.mouse.click(c[0], c[1]); await page.waitForTimeout(80); };
  const at = sel => page.$eval(sel, e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  ok(await page.$eval('#paint', e => getComputedStyle(e).display !== 'none'), 'the «لون السلك» toolbar is there (the table has wires / bridging plugs)');
  await tapEl(await at('#pBucket')); ok(await page.evaluate(() => BENCH.paint === 'red' && !document.getElementById('pSw').hidden), 'the bucket opens with a colour already picked (red)');
  await tapEl(await at('#pSw [data-c="blue"]'));
  // a colour picked before taking a wire from «العلبة» goes to the wire placed
  await H.bag('W'); const A = await H.node(0), B = await H.node(2); await H.tap(A.x, A.y); await H.tap(B.x, B.y);
  const w = await page.evaluate(() => { const S = BENCH.sim.RT.S, w = S.wires[S.wires.length - 1]; return w && { id: w.id, col: S.wcol[w.id] }; });
  ok(w && w.col === 'blue', `the new wire comes out in the picked colour (${w && w.col})`);
  await page.evaluate(() => { const S = BENCH.sim.RT.S; S.wireMode = false; BENCH.drawerSync(); BENCH.sim.render(); });
  // a real tap on the wire paints it
  await tapEl(await at('#pSw [data-c="green"]'));
  const mid = await page.evaluate(id => { const p = document.querySelector(`#bench [data-k="wire:${id}"]`); const q = p.getPointAtLength(p.getTotalLength() / 2); const m = p.getScreenCTM(); return [q.x * m.a + q.y * m.c + m.e, q.x * m.b + q.y * m.d + m.f]; }, w.id);
  await tapEl(mid); ok(await page.evaluate(id => BENCH.sim.RT.S.wcol[id], w.id) === 'green', `a ${H.touch ? 'finger tap' : 'click'} on the wire paints it green`);
  // bridging plug: placed in the current colour, and repainted by a tap
  await H.place('BR', 4, 5); const br = await page.evaluate(() => { const S = BENCH.sim.RT.S, p = S.parts[S.parts.length - 1]; return { id: p.id, col: S.wcol['p' + p.id] }; });
  ok(br.col === 'green', 'a bridging plug placed in paint mode takes the colour');
  await tapEl(await at('#pSw [data-c="yellow"]')); await tapEl(await at(`#bench [data-k="part:${br.id}"]`));
  ok(await page.evaluate(id => BENCH.sim.RT.S.wcol['p' + id], br.id) === 'yellow', 'a tap repaints the bridging plug');
  // instrument leads keep their colours
  await page.evaluate(() => BENCH.fitAll()); await page.waitForTimeout(300);
  await tapEl(await at('#bench [data-k^="head:"]'));
  ok(/ألوانها ثابتة/.test(await page.$eval('#toast', e => e.textContent)) && await page.evaluate(() => BENCH.sim.RT.S.pick == null), 'a tap on an instrument lead says its colours are fixed');
  await tapEl(await at('#pBucket')); ok(await page.evaluate(() => BENCH.paint === null), 'the bucket again leaves colour mode');
  await page.evaluate(() => BENCH.sim.reset());
  await page.click('#bStand'); await page.waitForTimeout(300);
}
