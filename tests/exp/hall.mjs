import { sit, bench } from '../lib.mjs';
export async function run(page, vp, ok) {
  console.log(`[${vp}] hall + quick access`);
  // the site opens at the corridor entrance; doors follow the registry by study level, electives in the courtyard
  ok(await page.evaluate(() => { const c = HALL.debug.cur(), P = HALL.debug.P, S = HALL.debug.START; return c.kind === 'corridor' && Math.hypot(P.x - S.x, P.z - S.z) < 0.01 && P.yaw === 0; }), 'the site opens at the corridor entrance');
  const cor = await page.evaluate(() => { const D = HALL.debug.doors().filter(d => d.kind === 'lab'); return { codes: D.map(d => d.label), all: REGISTRY.labs.map(l => l.code), D: D.map(d => ({ lab: d.lab, x: d.x, z: d.z, closed: d.closed, court: d.court, ry: d.ry })) }; });
  ok(cor.codes.length === 13 && [...cor.codes].sort().join() === [...cor.all].sort().join(), `one door per lab in the registry (${cor.codes.length})`);
  const lv = await page.evaluate(() => REGISTRY.levels.map(v => ({ k: v.key, labs: v.labs.map(l => l.id) })));
  ok(lv.map(v => v.k).join() === '5,6,7,8,elective' && lv.map(v => v.labs.length).join() === '1,2,2,1,7', 'levels 5 → 8 then electives: 1, 2, 2, 1, 7 labs');
  const zOf = id => cor.D.find(d => d.lab === id).z;
  const main = lv.filter(v => v.k !== 'elective').flatMap(v => v.labs);
  ok(main.every((id, i) => !i || zOf(id) <= zOf(main[i - 1]) + 1e-9), 'corridor doors go level by level, in registry order');
  const pair = (a, b) => { const A = cor.D.find(d => d.lab === a), B = cor.D.find(d => d.lab === b); return Math.abs(A.z - B.z) < 1e-6 && A.x * B.x < 0; };
  ok(pair('ee205', 'ee312') && pair('ee302', 'ee357'), 'doors of a level face each other (EE205 ↔ EE312, EE302 ↔ EE357)');
  const signs = await page.evaluate(() => HALL.debug.court());
  const el = cor.D.filter(d => d.court);
  const wall = d => Math.abs(d.ry - Math.PI / 2) < 1e-6 ? 'L' : Math.abs(d.ry + Math.PI / 2) < 1e-6 ? 'R' : 'F';
  ok(el.length === 7 && ['L', 'F', 'R'].map(w => el.filter(d => wall(d) === w).length).join('/') === '2/3/2' && el.every(d => d.z < -signs.dG), 'the 7 electives open off the courtyard: 2 left / 3 front / 2 right');
  ok(cor.D.filter(d => d.lab !== 'ee312').every(d => d.closed) && !cor.D.find(d => d.lab === 'ee312').closed, 'every lab but EE312 has a closed door');
  // a closed door only shows a toast
  const closed = await page.evaluate(async () => { const D = HALL.debug.doors().find(d => d.lab === 'ee210'); HALL.debug.goDoor(D); await new Promise(r => setTimeout(r, 450)); return { kind: HALL.debug.cur().kind, msg: document.getElementById('prompt').textContent }; });
  ok(closed.kind === 'corridor' && /قريباً/.test(closed.msg) && /EE210/.test(closed.msg), 'a closed door stays shut and says قريباً');
  // the courtyard is reachable on foot and its stand returns to the entrance
  ok(await page.evaluate(() => { const c = HALL.debug.court(); const p = HALL.debug.planTo(0, c.cz + 2); const e = p[p.length - 1]; return Math.hypot(e.x, e.z - (c.cz + 2)) < 0.05 && !HALL.debug.blocked(0, c.cz + 2) && !HALL.debug.blocked(0, -c.dG - 0.3); }), 'the courtyard can be walked to from the entrance');
  const back = await page.evaluate(async () => { const c = HALL.debug.court(), P = HALL.debug.P; P.x = 3; P.z = c.cz + 2; const D = HALL.debug.doors().find(d => d.kind === 'stand'); HALL.debug.goDoor(D); await new Promise(r => setTimeout(r, 700)); const S = HALL.debug.START; return Math.hypot(P.x - S.x, P.z - S.z); });
  ok(back < 0.01, '"عد إلى المقدمة" takes the student back to the entrance');
  // EE312 opens into its room; its exit door returns to the same spot in the corridor
  await page.evaluate(() => HALL.debug.doors().find(d => d.lab === 'ee312').go());
  const info = await page.evaluate(() => HALL.debug.benches().map(b => ({ num: b.num, x: b.x, z: b.z, built: b.built })));
  ok(info.length === 10 && await page.evaluate(() => HALL.debug.cur().lab === 'ee312'), 'the EE312 door opens into its room with 10 tables');
  ok(info.slice(0, 5).every((b, i) => b.num === i + 1) && info.slice(5).every((b, i) => b.num === i + 6), 'row 1 = Exp 1–5, row 2 = Exp 6–10');
  ok(info.slice(0, 5).every(b => b.z === info[0].z) && info[5].z > info[0].z && info.slice(0, 5).every((b, i, a) => !i || b.x > a[i - 1].x), 'two rows, left to right');
  const ret = await page.evaluate(() => { HALL.debug.doors().find(d => d.kind === 'exit').go(); const D = HALL.debug.doors().find(d => d.lab === 'ee312'), P = HALL.debug.P; return HALL.debug.cur().kind === 'corridor' && Math.hypot(P.x - D.front.x, P.z - D.front.z) < 0.01; });
  ok(ret, 'the room exit returns to the EE312 door in the corridor');
  await page.evaluate(() => HALL.debug.doors().find(d => d.lab === 'ee312').go()); await page.waitForTimeout(150);
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
  // quick access: level → its labs → experiments
  await page.click('#quickBtn');
  ok(await page.$eval('#quick', e => !e.hidden && [...e.querySelectorAll('[data-level]')].map(b => b.dataset.level).join() === '5,6,7,8,elective'), 'quick access lists the levels 5 → 8 and the electives');
  await page.click('#quick [data-level="6"]');
  ok(await page.$$eval('#quick [data-lab]', a => a.map(b => b.dataset.lab + (b.classList.contains('off') ? '-off' : '')).join()) === 'ee205-off,ee312', 'Level 6 shows EE205 (قريباً) and EE312');
  await page.click('#quick .qback'); await page.click('#quick [data-level="elective"]');
  ok((await page.$$eval('#quick [data-lab]', a => a.length)) === 7, 'Electives shows the seven elective labs');
  await page.click('#quick [data-lab="ee433"]'); await page.waitForTimeout(500);
  ok(await page.evaluate(() => { const D = HALL.debug.doors().find(d => d.lab === 'ee433'), P = HALL.debug.P; return HALL.debug.cur().kind === 'corridor' && Math.hypot(P.x - D.front.x, P.z - D.front.z) < 0.01 && /قريباً/.test(document.getElementById('prompt').textContent); }), 'a lab without experiments takes the student to its door (قريباً)');
  await page.click('#quickBtn'); await page.click('#quick [data-level="6"]');
  await page.click('#quick [data-lab="ee312"]');
  const items = await page.$$eval('#quick [data-exp]', a => a.map(b => ({ id: b.dataset.exp, off: b.classList.contains('off'), soon: !!b.querySelector('.soon') })));
  ok(items.length === 10, 'level 2 lists the 10 experiments');
  const built = await page.evaluate(() => REGISTRY.all().filter(e => e.built).map(e => e.id).join());
  ok(items.filter(i => i.off).every(i => i.soon) && items.filter(i => !i.off).map(i => i.id).join() === built, `built ones active (${built}), unbuilt greyed with قريباً`);
  const off = items.find(i => i.off);
  if (off) { await page.$eval(`#quick [data-exp="${off.id}"]`, b => b.click()); ok(await page.$eval('#seatModal', e => e.hidden), 'greyed experiment does nothing'); }
  await page.keyboard.press('Escape');
}

