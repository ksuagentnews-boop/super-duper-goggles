# Progress

Updated after every finished item (commit + push each time).

## Done
- EE312: all ten experiments (Exp 6 and 8 on the PC table), corridor by study level, electives courtyard, quick access, two DMMs, wiring lines, bidi fix, welcome card, GoatCounter hooks, diode in the DMM jacks (Exp 1 A).
- **1 · Phone fit for real**
  - The bench follows `visualViewport`, so the host app's top bar and the iPhone toolbars are left out. It also respects the safe areas, and it refits on resize, rotation and visual-viewport scroll.
  - The default layout is chosen for the free area of the current screen: wide on phone landscape, taller where the step card takes height. Every candidate is still crossing-free.
  - The overview is fitted to instruments + board with a ≈4 % margin.
  - The hint bubble is small, is shown once per session and fades.
  - The manual sheet slides up as an overlay on short (≤ 520 px) and touch-tablet screens, so the bench keeps the width.
  - The portrait top bar is a single scrolling row.
  - Checked at 844×390, 390×844, 932×430 and iPad (1180×820).

- **2 · Device zoom ≈90 %**
  - Tapping a device body shows that device alone at ≈90 % of the free screen (89–91 % at every tested size).
  - The parts box, hint, toolbar, board, other instruments and other leads are hidden.
  - The step card keeps only its text.
  - ✕ / ESC returns to the overview.

- **3 · Lead tray**
  - Every lead starts unplugged in the «Coaxial cables & wires» tray, one named slot per lead: `CH1 probe`, `GEN OUT`, `DC + (L)`, `DMM 1 red`, …
  - Coax leads lie as a BNC + red clip + black clip; banana leads as red/black plugs.
  - The student drags the instrument end to its jack/BNC (the target glows) and the board end(s) to nodes. The circuit sees a lead only when both ends are in.
  - Pulling the instrument end out leaves the clip on the board but takes it out of the circuit. Dropping either end on the tray puts the whole lead back.
  - A diode put into the DMM jacks pushes the probe leads back to the tray.
  - The tray is part of the default layout (below, right or left of the board, whichever fits the screen best) and of the overview fit.
  - Manual steps: before the first line that takes a lead to the board, a line plugs that lead into its instrument (e.g. `CH1 probe: BNC → CH1`), ticked from the real connection. Exp 10 also gets explicit lines for DMM 2.
  - Tests: helpers plug the instrument end first. New checks for the tray, unplug / return-to-tray, and "every lead the run plugs in has its own line in the Manual steps".
  - Still open from item 1: portrait (390×844) stays width-bound when a table has many instruments, because each instrument keeps its jacks facing the board.

- **4 · Welcome card and du'a**
  - The card shows the title, the small light disclaimer «هذه المعامل مصممة لمحاكاة المعمل الأصلي…» and «ابدأ».
  - The du'a «أسأل الله لنا ولكم التوفيق والسداد» is a small line under «قسم الهندسة الكهربائية» on the corridor's first sign.

- **5 · Procedure picker (Manual mode)**
  - After choosing Manual, a card lists the experiment's procedures (all ticked) with the note about procedures dropped this term. «ابدأ» stays disabled while nothing is ticked.
  - Each step belongs to the procedure named at its start ("Procedure A: …") until the next one.
  - Only the picked procedures' steps run. The card counts per procedure («Procedure B · الخطوة 1 من 7»), and «خلصت Procedure A ← ننتقل لـ Procedure B» shows when one procedure ends.
  - Plug-in lines are rebuilt for the picked procedures, so a lead's first use always gets its line.
  - Sheet sections are tagged with `data-proc`. Tables whose caption names a procedure, "Procedure X" PLQs and "Procedure X" headings are tagged automatically. Unpicked sections are hidden, and PLQ numbers stay fixed.
  - Grading uses `grader.proc(p)`: rows of unpicked procedures are left out of the score.
  - Each experiment file now has `procs` (titles), and sections and rows tagged by hand where they mix procedures.
  - Test `tests/exp/procs.mjs`.
  - Not needed for EE312, and not built yet: a different instrument list per procedure (EE205).

- **6 · Kept out of search engines**
  - `<meta name="robots" content="noindex,nofollow">` in `index.html` (checked by the hall test).
  - `robots.txt` with `Disallow: /`. On a GitHub Pages *project* site, robots.txt only counts at the domain root, so the meta tag is the part that matters there.

- **7 · Pre-launch validation** → `docs/ee312/VALIDATION.md`
  - `tests/validate.mjs` runs every Manual procedure and compares 67 graded values with theory, datasheets and the real Exp 1 readings: **67/67 within tolerance**. The PC tables are re-simulated in steady state.
  - `tests/robust.mjs`: 120 random actions per bench plus edge cases (OVL, short → CC, A jack across the supply, knobs at both ends, reversed electrolytic 💥, scope knobs at their ends). No errors, no NaN.
  - Fixed: placing a wire or part on a node that holds a lead clip grabbed the lead.
  - Hall renders at 1.5× on touch devices (≈1.7× faster).
  - Device matrix: Chromium desktop / phone / iPad emulation pass. Safari, Firefox and real phones still need a manual check.

## In progress
- 8 · Parts box renamed «العلبة» with a small SVG box icon.

## Next
- Merge into `main` after item 8; ask the owner whether the request continued after item 8 (the message was cut off).
