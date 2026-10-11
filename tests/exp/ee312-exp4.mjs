import { sit, bench } from '../lib.mjs';
export async function run(page, vp, ok) {
  console.log(`[${vp}] Exp 4 · Manual mode`);
  await sit(page, 'ee312/exp4', 'manual');
  const H = bench(page); H.touch = vp === 'phone';
  await H.focus('sc'); await H.key('s:PWR');
  await H.focus('board'); await H.lead('tB', 9); await H.lead('tA', 0); await H.lead('tC', 7);
  await H.place('D', 0, 1); await H.place('D', 7, 8); await H.place('BR', 1, 8); await H.place('R47', 1, 2); await H.place('BR', 2, 9);
  await H.lead('c1r', 0); await H.lead('c2r', 1); await H.lead('c1b', 2); await H.lead('c2b', 9);
  await H.focus('xf'); await H.key('x:CHECK'); ok((await H.steps()).done === 2, 'instructor check passes');
  await H.key('x:PLUG'); ok((await H.steps()).done === 3, 'transformer plugged, full-wave seen');
  await H.focus('sc'); await H.key('s:Default'); await H.key('s:CH2'); await H.key('s:Autoset'); ok((await H.steps()).done === 4, 'full-wave displayed');
  await H.focus('board'); await H.del(7, 8); ok((await H.steps()).done === 5, 'half-wave without D2');
  await H.place('D', 7, 8); await H.focus('sc'); await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1'); ok((await H.steps()).done === 6, 'VTC (XY)');
  await H.focus('xf'); await H.key('x:PLUG'); await H.focus('board'); await H.place('C470', 8, 9); await H.focus('xf'); await H.key('x:CHECK'); await H.key('x:PLUG');
  await H.focus('sc'); await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S0'); ok((await H.steps()).done === 7, '470 µF filter');
  await H.key('s:CH2'); await H.key('s:B0'); ok((await H.steps()).done === 8, 'CH2 AC coupling');
  await H.focus('board'); await H.del(1, 2); await H.place('R270', 1, 2); ok((await H.steps()).done === 9, 'RL = 270 Ω');
  await H.del(1, 2); await H.place('R100', 8, 15); await H.place('BR', 9, 16); await H.place('BR', 16, 23); await H.place('BR', 22, 23); await H.place('Z', 15, 16); await H.flip(15, 16); await H.place('R270', 15, 22); await H.lead('c2r', 15);
  ok((await H.steps()).done === 10, 'regulator (Fig. 6) — all steps done');
  await page.click('#bStand'); await page.waitForTimeout(400);
}

