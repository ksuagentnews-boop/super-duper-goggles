import { sit } from '../lib.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee312/exp6', 'exam');
  await page.evaluate(() => BENCH.sim.RT.act('new'));
  await page.waitForTimeout(300);
  console.log(await page.evaluate(() => { const r = document.getElementById('pcSch').getBoundingClientRect(), c = document.getElementById('stepCard').getBoundingClientRect(), a = document.getElementById('pcapp').getBoundingClientRect(); return JSON.stringify({ sch: [r.x, r.y, r.width, r.height], card: [c.x, c.y, c.width, c.height], app: [a.x, a.y, a.width, a.height], inner: [innerWidth, innerHeight], view: BENCH.sim.RT.S.view, cls: document.getElementById('stepCard').className }); }));
  await page.screenshot({ path: '/tmp/claude-0/-home-user-super-duper-goggles/770be6e5-b521-58b3-b5e8-711ece51352c/scratchpad/e6.png' });
  ok(true, 'x');
}
