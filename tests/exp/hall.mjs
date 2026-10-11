import { sit, bench } from '../lib.mjs';
export async function run(page, vp, ok) {
  console.log(`[${vp}] hall + quick access`);
  const info = await page.evaluate(() => HALL.debug.benches().map(b => ({ num: b.num, x: b.x, z: b.z, built: b.built })));
  ok(info.length === 10, '10 tables in the hall');
  ok(info.slice(0, 5).every((b, i) => b.num === i + 1) && info.slice(5).every((b, i) => b.num === i + 6), 'row 1 = Exp 1–5, row 2 = Exp 6–10');
  ok(info.slice(0, 5).every(b => b.z === info[0].z) && info[5].z > info[0].z && info.slice(0, 5).every((b, i, a) => !i || b.x > a[i - 1].x), 'two rows, left to right');
  ok(await page.evaluate(() => HALL.debug.cur().kind === 'room' && HALL.debug.cur().lab === 'ee312'), 'with one lab the site opens straight into its room');
  ok(await page.evaluate(() => HALL.debug.doors().some(d => d.label === 'EXIT')), 'the room has an exit door to the corridor');
  const corr = await page.evaluate(() => { HALL.debug.show('corridor', null, 'ee312'); const d = HALL.debug.doors(); return { n: d.length, labels: d.map(x => x.label), labs: REGISTRY.labs.map(l => l.code) }; });
  ok(corr.n === corr.labs.length && corr.labels.join() === corr.labs.join(), `corridor has one door per registered lab (${corr.labels})`);
  await page.waitForTimeout(150);
  await page.evaluate(() => { const D = HALL.debug.doors().find(d => d.label === 'EE312'); D.go(); });
  ok(await page.evaluate(() => HALL.debug.cur().lab === 'ee312' && HALL.debug.benches().length === 10), 'entering the EE312 door loads its room with its tables');
  if (vp === 'desktop') {
    await page.mouse.click(700, 600); await page.waitForTimeout(250);
    ok(await page.evaluate(() => HALL.debug.locked()) && await page.$eval('#crosshair', e => !e.hidden), 'desktop: first click locks the mouse and shows the crosshair');
    const y0 = await page.evaluate(() => HALL.debug.P.yaw); await page.evaluate(() => document.getElementById('hallCanvas').dispatchEvent(new MouseEvent('mousemove', { movementX: 60, bubbles: true })));
    ok(await page.evaluate(y0 => HALL.debug.P.yaw < y0, y0), 'moving the mouse (no drag) turns the view');
    await page.evaluate(() => { const B = HALL.debug.benches()[2]; const P = HALL.debug.P; P.x = B.x + 0.3; P.z = B.cz + 1.6; const dx = B.x - P.x, dz = B.cz - P.z; P.yaw = Math.atan2(-dx, -dz); P.pitch = Math.atan2(0.5 - P.y, Math.hypot(dx, dz)); });
    await page.waitForTimeout(150); await page.mouse.click(700, 600); await page.waitForSelector('#seatModal:not([hidden])', { timeout: 15000 });
    ok(/EXPERIMENT 3/i.test(await page.$eval('#smKicker', e => e.textContent)) && !(await page.evaluate(() => HALL.debug.locked())), 'click on the chair under the crosshair sits (Exp 3) and releases the mouse');
    await page.click('#smStand'); await page.waitForTimeout(400);
  }
  await page.click('#quickBtn');
  ok(await page.$eval('#quick', e => !e.hidden && e.querySelectorAll('[data-lab]').length === 1), 'quick access level 1 lists the labs');
  await page.click('#quick [data-lab="ee312"]');
  const items = await page.$$eval('#quick [data-exp]', a => a.map(b => ({ id: b.dataset.exp, off: b.classList.contains('off'), soon: !!b.querySelector('.soon') })));
  ok(items.length === 10, 'level 2 lists the 10 experiments');
  const built = await page.evaluate(() => REGISTRY.all().filter(e => e.built).map(e => e.id).join());
  ok(items.filter(i => i.off).every(i => i.soon) && items.filter(i => !i.off).map(i => i.id).join() === built, `built ones active (${built}), unbuilt greyed with قريباً`);
  const off = items.find(i => i.off);
  if (off) { await page.$eval(`#quick [data-exp="${off.id}"]`, b => b.click()); ok(await page.$eval('#seatModal', e => e.hidden), 'greyed experiment does nothing'); }
  await page.keyboard.press('Escape');
}

