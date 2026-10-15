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
  - Per-procedure instruments: an instrument spec may carry `procs:[…]`; in Manual the current step's procedure decides what stands on the table (leads of a leaving instrument go back to the tray, layout refits); Free mode shows everything. Not used by EE312.

- **6 · Kept out of search engines**
  - `<meta name="robots" content="noindex,nofollow">` in `index.html` (checked by the hall test).
  - `robots.txt` with `Disallow: /`. On a GitHub Pages *project* site, robots.txt only counts at the domain root, so the meta tag is the part that matters there.

- **7 · Pre-launch validation** → `docs/ee312/VALIDATION.md`
  - `tests/validate.mjs` runs every Manual procedure and compares 67 graded values with theory, datasheets and the real Exp 1 readings: **67/67 within tolerance**. The PC tables are re-simulated in steady state.
  - `tests/robust.mjs`: 120 random actions per bench plus edge cases (OVL, short → CC, A jack across the supply, knobs at both ends, reversed electrolytic 💥, scope knobs at their ends). No errors, no NaN.
  - Fixed: placing a wire or part on a node that holds a lead clip grabbed the lead.
  - Hall renders at 1.5× on touch devices (≈1.7× faster).
  - Device matrix: Chromium desktop / phone / iPad emulation pass. Safari, Firefox and real phones still need a manual check.

- **8 · «العلبة»**
  - The parts box is called «العلبة» everywhere (title, folded button, aria labels, the Free-mode description, the Exp 1 step).
  - It has a small open-box SVG icon in the accent colour instead of 🎒. Checked by the instruments test.

## Batch 2 (bench rules, Oct 2026)
- **B1 · Generic leads**
  - The tray holds leads by type (`coax probe`, `GEN coax`, `red lead`, `black lead`), one per jack of the table. Each is drawn as a real cable lying coiled, with its head (BNC / banana) and clips.
  - A lead's jack label (CH1, L +, HI …) appears only once it is plugged.
  - Drag the head: the whole lead moves as one piece and snaps into the nearest compatible free jack. Its clips stay free for the board.
  - Tap a lead: every compatible free jack lights up; tap one to plug. Tapping elsewhere cancels.
  - A head pulled out leaves the clips on the board, out of the circuit. Dropping a head or a clip on the tray puts the whole lead back.
  - Manual plug-in lines read "coax probe: BNC → CH1" / "red lead → L +".
  - Lines accept the other unit / meter where the manual names none: the Exp 1 and 2 supply (L or R), and the Exp 10 resistance readings (DMM 1 or 2). Scope channels stay as the manual names them.
  - Tests updated: the helper plugs a free lead by dragging its head, plus new tray and tap-to-plug checks.

- **B2 · Free pan & pinch-zoom**
  - Pinch (phone / iPad) or wheel (desktop) zooms between the fitted view and 4× closer, around the fingers / pointer.
  - Dragging empty desk pans, stopping a little past the edges. Dragging a control, part, lead or handle never pans.
  - A double-tap on empty desk or the «عرض كامل» button refits.
  - The same works inside a device zoom and the board zoom.
  - The camera is the SVG viewBox, so nothing is laid out again.
  - The user's zoom is kept while working (step card changes, moved instruments). A change of view resets it.
  - Test `tests/exp/gestures.mjs` (wheel on desktop, CDP two-finger pinch on phone).

- **B3 · Board zoom**
  - Tapping the board's frame (not a hole) zooms onto the plug-in panel at ≈90 % of the free area (90–91 % measured on desktop, phone and portrait). The parts box stays visible.
  - Pinch / wheel and pan work inside it.
  - On a lead line, «وريني وين» shows the overview (jack + node), because the tray and the rack are outside the board zoom.

- **B4 · `?debug=1` overlay**
  - Adding `?debug=1` to the link shows a small corner overlay with:
    - innerWidth/Height and the visualViewport (size, offset, scale);
    - devicePixelRatio and the safe-area insets (CSS `env()` probe);
    - whether the page runs in an iframe;
    - the bench's stage and free rect, the layout's assumed area, the fitted bbox on screen, the current view's target and its fill %.
  - It measures only the page's own window (never `screen.*`), so it is right inside the Claude app's preview iframe.
  - The bench also refits when the stage itself changes size (ResizeObserver), e.g. iOS bars or the host app's bars, not only on window resize.
  - To use it: open the site link with `?debug=1` on the iPhone (Claude app and Safari), sit at a crowded table (Exp 9), take one screenshot of the overview and one of a device zoom, and send them.

- **B5 · Nothing on the desk under the UI**
  - The bench tools (ترتيب افتراضي, لون السلك, عرض كامل) are compact icon-over-label buttons. They sit in a column at the right edge in landscape, or a row on top on tall screens, and the fit reserves that strip.
  - The once-only hint shows over the top bar, not on the desk.
  - The bench also refits when the parts box or the step card change size.
  - New check in `tests/exp/bidi.mjs`: for every experiment, no instrument, board or tray sits under the parts box, a tool, the hint, the zoom chip or the step card, or off the stage.
  - The check passes at desktop, 844×390, 844×330 (host-app bars), 932×430, 740×360, 667×375, 390×844 and iPad.
  - Full desktop + phone regressions pass.

## Batch 3 (phone polish, real iPhone)
- **P1 · Device zoom animates**
  - The camera moves smoothly (380 ms ease) into a device and back out, like the board zoom.
  - The jump cut came from the parts box hiding as the zoom starts: the stage resize refit the camera instantly. A resize during the move now only updates the move's target.
  - The rest of the desk fades out instead of vanishing.
  - Tested with motion on, in and out, on desktop and phone.

- **P2 · Zoomed instrument usable by finger**
  - A device zoom frames the instrument body edge to edge: 97–99 % of the limiting side. The ✥ handle is hidden there.
  - On touch inside a device zoom, a tap that misses every control goes to the nearest control within 22 px. Every knob, key and arrow gets a ≥ 44 px target without the targets overlapping.
  - Scope menus (Measure, Acquire, Display, Cursor, Trigger, channel menus, the side keys and the measurement lists) open on touch as a large list over the scope's screen: 44 px rows that scroll if many. A row presses the same soft key or picks the same list item.
  - The list stays exactly over the screen, so the soft keys around it stay free.
  - Pinch still goes closer.
  - Tests: gestures (near-tap, list rows, picking), instruments (zoom fill > 95 %), full phone regression.

- **P2b · Knobs on touch** (the owner's correction: VARIABLE and every rotary knob)
  - A finger drag on a knob (or the grab ring around it, or its arrows) turns it one detent per 14 px: right / up = +. A tick flash shows each detent.
  - A tap on a knob shows two big ◀ ▶ buttons beside it (48×44 px, press-and-hold repeats) with the live value («L 5.50 V», «CH1 200mV/div», the list item under VARIABLE…), and ● for push knobs. A tap elsewhere hides them.
  - This works in the overview, in device zoom and while pinch-zoomed. On desktop the wheel also turns a knob from its body.
  - Covers the scope (VARIABLE, VOLTS/DIV, TIME/DIV, POSITION, LEVEL), the generator knob, the supply COARSE / FINE / CURRENT knobs and the decade boxes.

- **P3 · A moved instrument stays on top**
  - Grabbing an instrument's ✥ brings it, and the leads plugged into it, to the top layer, above the tray, the board, the other leads and the other instruments. It stays there after the drop until another one is grabbed.
  - Dropped over the board or the lead tray, it slides to the nearest free spot clear of both.
  - The ✥ handle has a constant on-screen size whatever the zoom: 36 px on touch (28 px with a mouse) plus an invisible ring for the finger. It is dark green with a white border, at the instrument's top-left corner.
  - Tests: instruments (on top, handle size, drop on the board settles).

- **P4 · The hint covers no button**
  - On desktop the once-only hint is now an item in the top bar, in the free space between the title and the buttons. It shortens with "…" if needed, and is skipped if that space is under 160 px.
  - It is not shown on touch devices (phones, iPad). There it sat over «بدّل للمانيوال» / «من جديد».
  - Test (instruments): desktop hint over no top-bar button; no hint on the phone.

- **P5 · «العلبة» on touch**
  - A slim scrollbar strip on the box's inner edge, always there on touch when the parts overflow. Space is reserved for it, so it covers no part.
  - Touching the strip thickens it (4 → 10 px, 16 px touch width). Dragging the thumb scrolls smoothly, and a tap on the track jumps there.
  - A vertical swipe on a part or on the gaps scrolls the box, with momentum.
  - A part comes out only after a sideways move or a 0.3 s hold. A swipe that scrolls and then leaves the box sideways also takes the part. A tap arms the part (tap again to disarm), as before.
  - Desktop is unchanged: mouse wheel, and a press drags at once.
  - Also: the ✥ handle shrinks on instruments drawn small (portrait), never under 24 px, and stays 36 px in phone landscape. A view change closes the knob ◀ ▶ buttons.
  - Tests (gestures, every touch viewport): strip, swipe on a part / on the gaps, track tap, thumb drag, sideways lift, hold lift, tap arm / disarm. Checked at 844×390, 932×430, 390×844 and iPad.

- **Batch 3 checks:** full desktop + phone regressions pass. The touch checks also run at 932×430, 390×844 and iPad.
- **Knobs on touch, owner's correction re-checked:** a new gestures test turns the scope's VARIABLE knob by finger in the scope zoom: a 44 px drag moves the list 3 items, a tap shows ◀ ▶ (44 px) with the item name, and ◀ steps back. It also turns it pinch-zoomed closer. Checked on phone, portrait and iPad.

## Batch 4 (owner's test, 13 Oct)
- **9 · One coax kind:** a single generic `coax` lead (BNC → red + black clip) fits every BNC (scope CH1–4, generator OUT); a tap lights all free BNCs.
- **5 · Wire colour tool works:** the bucket opens with a colour picked; real taps paint wires and bridging plugs (wide tap area while painting); new wires / plugs take the picked colour; a tap on an instrument lead gives the fixed-colours toast; hidden when the table has no wire or plug. Test `tests/exp/paint.mjs`.
- **10 · Lab only:** ⟩ on the step card / the sheet panel's edge hides the right-hand page; the bench refits; a 📋 tab (showing «الخطوة N» in Manual) brings it back; remembered for the session. Test `tests/exp/labonly.mjs`.
- **4 · PeakTech 4124 redrawn** from the lab photo (blue bumpers, colour LCD with soft menu, F1–F5, keypad, knob, CH1/CH2 area with OUT1/OUT2, waveform keys); behaviour, size and OUT1 position unchanged.
- **1 · Highlights under parts:** the current line's node squares are drawn in a layer under the parts and leads (jack rings stay on top); they move on as soon as the connection is made.
- **7 · Decade boxes separate:** `{type:'dbox'}` becomes two instruments (`dbox` A, `dbox2` B), each with its own ✥ handle, saved position and zoom; shared state and circuit unchanged.
- **8 · Last moved on top:** an instrument, a lead or a part moved last is drawn on the top layer until something else is moved.

## EE205 · Electric Circuits Lab
- Engine: phasor ac steady state, transient sub-steps, coils and film caps, registry + 2 × 4 room.
- Instruments: Hameg HM 203-7, Metrix MTX 3240, Thandar TS3022S, handheld DMMs (Fluke 77 / GoldStar / BK 2704B), YEW 2786.
- Exp 1 built (Procedures I–IV, 30 steps, sheet graded); test `tests/exp/ee205-exp1.mjs` desktop + phone.
- Exp 2 built (Procedures I–III, 28 steps); test `tests/exp/ee205-exp2.mjs` desktop + phone.
- Exp 3 built (Procedures I–II, 22 steps); test `tests/exp/ee205-exp3.mjs` desktop + phone.
- Exp 6 built (Procedures I–II, 11 steps, transient with sub-steps); test `tests/exp/ee205-exp6.mjs` desktop + phone.
- Exp 8 built (Procedures I–IV, 19 steps); test `tests/exp/ee205-exp8.mjs` desktop + phone. Batch 1 (Exp 1, 2, 3, 6, 8) done.
- Batch 2 engine: ac sources with the instructor check (bench socket, variable ac supply, 3-phase transformer), fluorescent lamp, PX 120 wattmeter, BC05 capacitor box, rheostats, coupled coils (MC) in the solver, U-core part.
- Exp 7 built (Procedures I–IV, 12 steps); test `tests/exp/ee205-exp7.mjs` desktop + phone.
- Exp 4 built (6 steps, instructor check, 19 rows of Table 1); test `tests/exp/ee205-exp4.mjs` desktop + phone.
- Robustness sweep (tests/robust.mjs) covers the EE205 benches: 120 random actions each, no error / NaN; a Fluke mA jack across the supply blows its fuse; the mains sources refuse power before the instructor check and refuse an ammeter across the source.
- Per-procedure instruments built (`procs` on an instrument spec, `RT.setProc`): EE205 Exp 1 (I Fluke + YEW, II Thandar + Fluke, III Thandar + GoldStar, IV Thandar + GoldStar + 3 YEW), Exp 2 (Thandar only in I), Exp 3 (second Fluke only in I), Exp 5 (M2–M5 in I, PX 120 in II–III), Exp 8 (Fluke I–II, Hameg II–IV). Tests check the swaps.
- Exp 5 built (Procedures I–III, 10 steps); test `tests/exp/ee205-exp5.mjs`. Engine: phasor dc part ignores the mains sources (3-phase phases leaked a dc offset), the transformer's star point is internal, the layout search caps the top-row orders beyond 5 instruments (Exp 5 froze), meters bring one red + one black lead to the tray (their current jacks are spare sockets).
- Tests: hall knows EE205 is built (8 tables, 2 × 4); the pan & zoom test wheels over empty desk (EE312 Exp 9 layout moved when the crowded rack fix spread its plugs).

- Full suite after both batches: desktop + phone, 1127 checks, ALL PASSED, 0 console errors. All eight EE205 experiments built.

## In progress
- Batch 4: 10, 6, 1, 7, 8, 2 (4 in a parallel worktree).

## Next
- EE205: owner to try the eight tables (especially the generator key legends of the MTX 3240 and the YEW tolerances read from photos; see docs/ee205/QUESTIONS.md).
- Owner: open the site with `?debug=1` on the iPhone (Claude app + Safari) and send one screenshot of the Exp 9 overview and one of a device zoom, so the real numbers can be compared.
- Ask the owner whether the request continued after item 8 (the message was cut off after "everywhere in the UI and").
- Portrait layout for tables with many instruments (stack them; the lead tray now allows it).
- Check on real devices: Safari iPhone/iPad, Android Chrome, Firefox; hall frame rate on a phone.
- Batch 5 item 9: TTi / Thandar FINE knob. Every input path worked, but the FINE pointer turned ≈3° per step and in EE312 Exp 9 a 1 mV step did not show on the 2-decimal VOLTS display, so FINE looked dead. Now: VOLTS shows x.xxx below 10 V, FINE turns ≈12° per step, at ≥ 10 V a FINE step is one display digit (10 mV). New test `tests/exp/supply.mjs` (8 experiments with a supply, both units, both directions, arrows / wheel / touch drag / ◀ ▶ pad).
- Batch 5 item 7: «المشرف يتأكد من التوصيل» moved off the EE205 mains instruments into the Manual step card (shown while a source waits for the check, ✓ chip after); Free mode has no instructor check (POWER switches freely, the breaker still trips). Tests use H.chk(); robust sweep checks Manual lock + Free without it.
- Batch 5 item 2: move mode. The ✥ handle no longer sits on every instrument: one «✥ تحريك» button in the bench tools (four-way icon) lights move mode, the handles appear on every instrument / decade box, and a tap on a device body does not zoom; off again on the button or when sitting down. Tests: instruments.mjs (handles hidden by default, shown when lit, body tap does not zoom, off after re-sitting).
- Batch 5 item 4: Hameg HM 203-7 redrawn from the reference photo (layout, every label) with the lab unit's colours; real 2:1 front; new real controls HOLD OFF, TV SEP., ALT., EXT., ×5 Y MAG., trigger coupling ~; TIME/DIV 100 ms … 0.2 µs as printed. Notes + comparison: docs/ee205/instruments/hameg-notes.md, hameg-compare.png.
- Batch 5 item 5: three-phase transformer redrawn from the lab crops (red Leybold-Heraeus housing, white rocker, ∼ / transformer symbol, I max, two printed star/delta diagrams with 8 sockets, ⚠ + red lamp, black name band). Right set 23/40 V carries the experiment's leads, left set 6/10 V works as spare sockets. Also: the folded phone step card still shows the instructor-check button. Notes + comparison: threephase-notes.md, threephase-compare.png.
- Batch 5 item 6: rheostats redrawn: four Leybold units, each the body seen from above (ventilated halves, black slider carriage on the rail, dragged smoothly, R follows) plus its separate dark end panel (red / black / green-yellow sockets, round element, max 500 V); the fake −10/+10 buttons and Ω readout removed. Board: generic slide: drag (instrument slideTo). Notes + comparison: rheostat-notes.md, rheostat-compare.png.
- Batch 5 item 8: variable ac supply redrawn as the lab's Leybold 521 35 (cream, red rocker, fuses 1.8 A / 6 A, 12 V ~ and 0…20 V ~ sockets, silver pointer knob with dots, printed bridge diagram, dc −/+ sockets, logo + product text); range 0…20 V as printed; 12 V ~ sockets work as spare sockets. Notes + comparison: variac-notes.md, variac-compare.png.
- Batch 5 item 3: Exp 4 has no ac supply instrument any more: a wall socket (stainless plate, duplex outlet, the mains lead's plug — tap to plug in / pull out — ending in L / N sockets for the banana leads), 127 V 60 Hz. Step texts updated; comparison wall-socket-compare.png.
- Batch 5 item 1: one common bench scale: every instrument at its real front size (ENGINE.REAL in mm × ENGINE.UPM 2.05 units/mm, the plug-in panel's scale), wrapped in board.js (size, lead points, diode jack slot, slider); handheld meters now clearly smaller than bench instruments. Table and sources: docs/INSTRUMENT-SIZES.md. Device zoom, phone fit and default layout unchanged in code.
- Batch 5 item 10: EE312 Exp 5 rebuilt on the Digilent breadboard as in the lab slides (engine/breadboard.js + breadboard mode in board.js): ±15 V from both EL302RD units through the binding posts, checked with the MT3805 (two meters on the table), µA741 across the channel, parts and kit jumpers hole to hole, BNC → mini-grabber hooks on standing jumpers; scope Default / Autoset, CH1 200 mV, CH2 1 V (5 V), CH3 2 V, 500 µs/div. µA741 output stage and slew rate fitted to the slides' readings, Zener 3.6 V (1N4729A). Validation rows vs the slides in docs/ee312/VALIDATION.md; test rewritten (desktop + phone pass).
- Batch 6 item 6: three modes — المانيوال (steps, readings by «Capture», read-only sheet, no grading), الاختبار (same steps, typed sheet graded; score out of the experiment's graded steps, helpers cost marks: «وصّل لي» / «تخطّي» −1, «تلميح» −0.5) and حر. Seat modal has the three; the switch goes guided ↔ free. Full-marks tests now run in Exam mode.
- Batch 6 items 1, 2, 4, 5 (engine): engine/match.js compares the bench with a figure as circuits (injective net map, part types/values, polarity, instrument terminals, nothing extra on the circuit) and explains what is wrong («تلميح»); def.figs = {id:{img,cap,lines}} (reference wiring in the lab's rectangle layout); a step {build:id} is one step «وصّل الدائرة Fig. X» with the figure in the card, ticked by the matcher; step.acts = the manual step's actions line by line; helpers «وصّل لي» (RT.buildFig, animated), «تلميح», «تخطّي» (confirm); Manual «Capture» (step.rec = [{to,val,unit}|{scope}]) into the card and the sheet, «اكتفِ بهذه التسجيلات وانتقل». EE312 Exp 1 converted (figures 1.3a, 1.5a, 1.3b, 1.3b+RL; steps = manual A1–A5, B1–B11). Tests: manual.mjs (Manual flow), circuits.mjs (every figure: reference + second layout match, wrong circuits fail).
- Batch 6 item 7: EE312 Exp 5 coax = BNC → two mini-grabber hooks (named «coax · mini-grabber», hooks drawn even in the tray); a hook clips onto a standing jumper's bare end or straight onto a part's leg (signal and ground), follows the part when it moves, is freed when the part is removed.
- Batch 6 conversion: EE312 Exp 2 (Figs. 2.3a/b with rectifier and Zener, 11 manual steps) and Exp 3 (Figs. 3.4a / +gen / +scope, 3.4b; Procedures A 1–20, B 1–12) — figures in rectangle layout, status from the matched figure, Exam tests full marks, circuits test passes.
- Batch 6 conversion: EE205 Exp 4 (Fig. 4, manual steps 1–6, instructor check refuses a circuit that is not Fig. 4) and Exp 5 (Figs. 7, 8, 9; Procedures I 1–5, II 1–5, III 1–3) — Exam tests full marks, circuits test passes.
- Batch 6 conversion: EE312 Exp 5 (breadboard figures 5.4a/+gen/+scope/100k, 5.4b/+gen/+scope; A 1–14, B 1–9 with the slide 34–35 corrections), Exp 6 and 8 on the PC (manual steps A/B/C, Capture of the student's own run values, «تلميح»/«تخطّي» without «وصّل لي») — Exam tests full marks.
- Batch 6 conversion: EE205 Exp 1 (Figs. 5–8, Proc I–IV 21 steps), Exp 2 (Figs. 1–3, Proc I–III 21 steps), Exp 3 (Figs. 6a, 6b, 7, Proc I–II 10 steps) — measurement set-ups matched as circuits, Exam tests full marks, circuits test passes.
- Batch 6 conversion: EE312 Exp 9 (Figs. 9.2a with both meters, 9.2b with the decade boxes; A·a–c, B·1–5) and Exp 10 (Figs. 10.1, 10.2; A1–A4, B1–B7) — Exam tests full marks, circuits test passes.
- Batch 6 conversion: EE312 Exp 4 (Figs. 4.2 / +scope / C 10 µF / 470 µF / R_L 270 Ω, 4.3 / +scope / 270 Ω; A Assemble + 1–19, B 1–12) and Exp 7 (Figs. 7.1a, 7.1b, 7.1c 270 / 470 / 1k; A 1–5, B 1–6, C 1–6) — Exam tests full marks, circuits test passes.
- Batch 6 conversion: EE205 Exp 6 (Figs. 9, 10), Exp 7 (Figs. 7, 7b, 8, 9, 10, 10b; Proc I–IV with the instructor check), Exp 8 (Figs. 6, 7, 7cl, 8, 9; Proc I–IV; Table 2 grading fixed) — Exam tests full marks, circuits test passes. Matcher: alt may list several keys; EE312 Exp 9 decade boxes either way round.
- Batch 6 done: full suite desktop + phone ALL PASSED (1225 checks, 0 console errors); merged into main.
- Batch 7 item 1: three-phase transformer sockets on a straight symmetric layout (equal triangles, bottom corners on one line, apex and N above the middle of each base); screenshot docs/ee205/instruments/threephase-straight.png.
- Batch 7 item 2: EE312 Exp 5 Digilent board with three breadboards; posts ⏚ black, Vc red, Vb teal-blue, Va yellow; the lab's supply leads (green L − → Va, orange L + → ⏚, blue L + → R − stacked, dark red R + → Vb; def.leadCol); vertical rails ground only, ±15 V via the bottom breadboard's rails and jumpers up to the µA741; banana ends can stack on another plug (engine); «وصّل لي» colours its jumpers; test updated.
- Batch 7 item 3 (engine + EE312 Exp 1): the step card sits in the right-hand column (top of the manual page; docked on the right of the bench on phones / page closed), bigger text; steps carry sub-steps {k: build | connect | measure | set | rec, t, fig, ok, do, hint} ticking in order with ✓; each has its own «وصّل لي» / «قِس لي» / «اضبط لي» / «سجّل لي» (played on the bench: RT.press, RT.connectFig, RT.jackPut, A.until …) and «تلميح»; Exam costs −1 / −0.5; tests manual.mjs (Exp 1 whole Procedure B by do-it only), doall.mjs (every experiment by do-it only), units.mjs (no number without its unit in step text).
- Batch 7 item 3: EE312 Exp 2 and 3 in sub-steps, every one doable by «اضبط لي / وصّل لي / سجّل لي» (sweeps set each voltage with COARSE then FINE and capture), Exam full marks, doall / units / circuits pass.
