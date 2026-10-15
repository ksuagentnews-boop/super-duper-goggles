import { sit } from '../lib.mjs';
/* Batch 7 item 3: units and values in full in every step text — «200 mV/div», «1 kHz», «400 mVpp», never a bare number.
   Every step of every experiment (its text, its actions, its sub-steps and their hints) is read; a number that is not a
   label (Fig. 5.4a, Table 1.2, pin 7, CH1, 1N4001, step «3.» …) must be followed by its unit. */
const EXPS = process.env.UNIT_EXPS ? process.env.UNIT_EXPS.split(',') : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => 'ee312/exp' + n).concat([1, 2, 3, 4, 5, 6, 7, 8].map(n => 'ee205/exp' + n));
export async function run(page, vp, ok) {
  for (const exp of EXPS) {
    await page.goto('http://app.local/'); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 });
    if (await page.$eval('#welcome', e => !e.hidden)) await page.click('#wlStart');
    await sit(page, exp, 'manual');
    const bad = await page.evaluate(() => {
      const S = BENCH.rawSteps || BENCH.sim.rawSteps || BENCH.sim.steps, st = BENCH.sim.status(), out = [];
      const plain = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const UNIT = /^\s?(?:k|M|m|µ|u|n|p)?(?:V(?:pp|p-p|rms|dc|ac)?|A|Ω|Hz|s|F|H|W|VA|VAR|var|dB|°|%|\/div|V\/div|s\/div|cycles?|turns?|rpm|X\b|×|x\b|Φ|φ)(?![A-Za-z])/;
      const LABEL = /(?:Fig\.?|Figs\.?|Figure|Table|Tables|pin|pins|slide|slides|Procedure|step|steps|Step|eq\.?|eqs\.?|Eqs?\.?|equation|PLQ|PLQs|Exp|Experiment|column|columns|col|node|nodes|row|rows|channel|channels|coil|coils|terminal|terminals|CH|DMM|unit|Lab|Part|item|Section|page|p\.|pp\.|No\.?|#|الخطوة|خطوة|الخطوات|خطوات|الشكل|جدول|الجدول|رقم|الرقم|صف|عمود|تسجيل|المعادلة|معادلة|الحالة|للحالتين|الحالتين|طرف|الطرف|نقطة)\s*$/;
      const scan = (txt, where) => { const t = plain(txt); const re = /(?<![\w.·\-–/])(\d+(?:[.,]\d+)?)(?![\w])/g; let m, lastOk = -99;
        const good = () => { lastOk = m.index + m[0].length; };
        while ((m = re.exec(t))) { const before = t.slice(Math.max(0, m.index - 14), m.index), after = t.slice(m.index + m[0].length, m.index + m[0].length + 10), rest = t.slice(m.index + m[0].length);
          if (/^\./.test(after) && /(^|·\s*|\s)$/.test(before) && !/\d/.test(after.slice(1, 2))) { good(); continue; }   // a step number «3.»
          if (/^\.\d/.test(after) || /^[a-z]\b/.test(after) || /^-[a-z]\b/.test(after)) { good(); continue; }           // 1.3a, 5.4b, Eq. 6-a
          if (UNIT.test(after) || LABEL.test(before)) { good(); continue; }
          if (/\(\s?$/.test(before) && /^\s?\)/.test(after)) { good(); continue; }                                       // a reference «(2)», «(9.3)»
          if (/[A-Z][A-Za-z]+\s$/.test(before) && !/=\s?$/.test(before)) { good(); continue; }                          // names: Source 1, PX 120, Fluke 77
          if (/^\s?[A-Z]/.test(after) && !UNIT.test(after) || /^\s?√/.test(after)) { good(); continue; }               // coefficients: 3 IA² RA, 1.15 Rdc, 2√(L/C)
          if (m.index - lastOk <= 6 && /^\s?(?:و|،|,|and|or|–|-)\s?$/.test(t.slice(lastOk, m.index))) { good(); continue; }   // a list after a label: «خطوة 3 و 4»
          /* a list or a range whose last value carries the unit: «20، 15، 10 V», «1–10 V», «2 و 3 V» */
          const lst = rest.match(/^(?:\s?(?:،|,|و|–|-|→|to|and|or|إلى)\s?\d+(?:\.\d+)?)+/);
          if (lst && UNIT.test(rest.slice(lst[0].length))) { good(); continue; }
          if (/^\s?\(?\s?0\s?[,،]\s?0\s?\)/.test(t.slice(m.index - 1)) || /\(\s?0\s?[,،]\s?$/.test(before)) { good(); continue; }   // the origin (0, 0)
          if (/^\s?من قيمت/.test(after)) { good(); continue; }                                                           // a ratio «0.7 من قيمته»
          if (/(?:β\w*|gain|Gain|G|A_?v|ratio|n|N)\s?=\s?$/.test(before)) { good(); continue; }                          // unitless: β, gain, ratio
          if (/^(?:\/|\s?sin\(|\s?cos\(|π|·)/.test(after) || /(?:√|\^|·)\s?$/.test(before)) { good(); continue; }        // inside a formula: 5/√2, 10 sin(2π·10³t)
          if (/[×x]\s?$/.test(before)) { good(); continue; }                                                             // multipliers «× 10»
          if (/^\s?(?:دورات|دورة|مرات|مرة|قراءات|قراءة|ترددات|تسجيلات|نقاط|قيم|خانات|وحدات|بطاريات|دايودات|مقاومات|سلك|أسلاك|nodes?|holes?|readings?|values?|times?|points?|diodes?|cells?|coils?)/.test(after)) { good(); continue; }   // counts of things
          out.push(`${where}: «…${t.slice(Math.max(0, m.index - 24), m.index + m[0].length + 14)}…»`); } };
      S.forEach((s, i) => { const w = `step ${i + 1}`; scan(s.t || '', w); (s.acts || []).forEach(a => scan(a, w + ' act'));
        (BENCH.subsOf ? BENCH.subsOf(s) : []).forEach((x, j) => { scan(x.t || '', `${w} sub ${j + 1}`); if (typeof x.hint === 'string') scan(x.hint, `${w} sub ${j + 1} hint`); }); });
      return out; });
    ok(!bad.length, `${exp}: every number in the step texts has its unit` + (bad.length ? ` · ${bad.length}: ` + bad.slice(0, 12).join(' | ') : ''));
  }
}
