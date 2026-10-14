import { sit, bench } from '/home/user/super-duper-goggles/tests/lib.mjs';
import { pcDriver } from '/home/user/super-duper-goggles/tests/pc.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp8', 'manual');
  const H = bench(page); const P = pcDriver(page, false);
  const done = async n => (await H.steps()).done >= n;
  const V = () => P.view(-3, -6, 0.8);
  await P.act('new'); await V();
  await P.place('V', 0, 4); await P.place('V', 10, -2); await P.place('R', 6, -2); await P.act('R'); await P.place('NM', 4, 2);
  for (const [x, y] of [[10, 2], [6, 6], [0, 8]]) await P.place('GND', x, y); await P.act('GND');
  await P.value('R1', '{RD}'); await P.mos('M1', 'N_1u'); await P.source('V2', 'DC', '5');
  await P.wire([6, -2], [10, -2], [7, 4], [7, 6], [7, 6], [6, 6], [0, 4], [4, 4]); await P.act('wire');
  await P.label('in', 0, 4); await P.label('out', 6, 2);
  await P.dir('.lib mosfet1u.lib\n.step param RD 10k 110k 20k', 14, -1);
  await P.source('V1', 'PULSE', [0, 5, 0, '0.1n', '0.1n', '10n', '20n', 3]);
  await P.dc('V1', '0', '5', '5m'); await P.at(14, 4); await P.run(); await V(); await P.probe(6, 2);
  ok(await done(8) && !(await done(9)), 'Manual: A9 waits for its captures');
  ok(!!(await page.$('#stepCard #scCap')) && !(await page.$('#stepCard #scBuild')), 'Capture button, no وصّل لي');
  await page.evaluate(() => BENCH.capture(BENCH.sim.steps[BENCH.cur()])); await page.evaluate(() => BENCH.capture(BENCH.sim.steps[BENCH.cur()]));
  ok(await done(9), 'A9 captured: ' + await page.evaluate(() => [document.getElementById('a_slope').value, document.getElementById('a_vol').value].join()));
  await P.tran('60n', '0', '0.01n'); await P.run(); await V(); await P.probe(6, 2); await P.probe(0, 4);
  await page.evaluate(() => BENCH.capture(BENCH.sim.steps[BENCH.cur()]));
  ok(await done(13), 'A13 gate: ' + await page.evaluate(() => document.getElementById('a_gate').value));
  await P.zoomW(0.15, 0.2); await page.evaluate(() => BENCH.capture(BENCH.sim.steps[BENCH.cur()]));
  ok(await done(14), 'A14 rd: ' + await page.evaluate(() => document.getElementById('a_rd').value));
  await page.evaluate(() => BENCH.hintFor(BENCH.cur())); ok(true, 'hint: ' + await page.$eval('#toast', e => e.textContent));
}
