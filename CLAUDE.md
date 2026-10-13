# EE Labs Simulator — محاكي معامل قسم الكهرباء

A static website (GitHub Pages, no server, no login) that simulates the EE department labs at King Saud University as a reference for students. Start: EE312 (Basic Electronics Lab). Later: ~8 labs × ~10 experiments.

## Source of truth
- `docs/<lab>/` holds the lab manual and slides (PDF/images). Every experiment MUST match them exactly: same instruments, same component values, same procedure steps, same figures, same questions.
- If the manual and these rules disagree, follow the manual and tell the user.
- Never invent instruments or steps. Component behaviour and readings are **yours to derive**: use the manual, the slides, the parts' datasheets and device physics to choose realistic models and values (e.g. a 1N4001 reads ≈0.55 V on diode test, a Ge point-contact diode ≈0.2–0.3 V, a green LED ≈1.7–2 V). Do not ask the user for numbers. Fallback only: if a value is still unclear after the manual, slides and datasheets, use the student's own lab reports in `docs/<lab>/measured/` (may contain mistakes).
- Resolve small gaps yourself (typos in figure numbers, one meter vs two drawn in a figure, unnamed parts) with the most reasonable reading of the manual and slides, note your assumption in the commit message, and keep going. Ask the user only when the manual and slides genuinely contradict each other on something that changes what the student does.

## Current state
- The site is split into `engine/` (shared) and `labs/` (one file per experiment). `index.html` only holds the shell markup and script tags.
  - `engine/solver.js` circuit solver (Newton dc op, quasi-static sweep for the generator, transient for C / transformer / op amps starting from the dc operating point; several floating supply units with CV/CC; meter test source). Device models: diodes (Si, Zener, Ge, LED), µA741 macro-model, IRF620 (FET), BD137 (BJT), inductors and ideal coupled transformers (for the PC simulator).
  - Instruments: `scope.js` (GDS-1104B, 4 channels), `gen.js` (PeakTech 4124), `psu.js` (TTi EL302RD, two units, per-experiment knob resolution), `dmm.js` (MCP MT3805; numbered meters `n:1/2` → keys `dmm`/`dmm2`, leads `mh ml`/`m2h m2l`; labs read them through `RT.meters()` / `RT.meterOn(a,b)`), `xf.js` (center-tapped transformer), `dbox.js` (two resistance decade boxes).
  - `board.js` bench runtime (lead tray «Coaxial cables & wires»: every lead starts unplugged, `S.jack[g]` = instrument end in its jack, `l.bn/l.bh` = board end, `l.node` = both ends in (what the solver sees), auto plug-in lines in Manual steps; default layout from where each instrument's terminals face — top row / left / right of the panel, no crossings, `RT.crossings()` checks it; movable instruments with a four-way move handle (unplugged leads travel with their instrument), arrangement saved per experiment in localStorage, `ترتيب افتراضي` restores it; plug-in panel, two-leg parts and multi-pin parts — DIP-8 op amp, TO-220 / TO-126 transistors — with real looks, cables with labels / shadow / colour menu, hover glow, netlist, analysis, LEDs that blink with slow signals), `bench.js` shell (zoom, bag drawer, stepper, Manual/Free; PC tables), `hall.js` 3D scenes (the site opens at the corridor entrance; corridor ordered by study level from the registry — level signs, doors facing each other, closed "قريباً" doors for unbuilt labs — ending in the electives courtyard with its "عد إلى المقدمة" stand; any lab room built from its registry entry, with signs and an exit door back to the same spot), `quick.js` الوصول السريع (level → labs → experiments; a lab without experiments jumps to its door).
  - Steps: build steps carry `lines` (one connection per line: `{t, note, part|ic|lead|wire}`, ticked from the netlist, current one highlighted on the board; `fig` beside the step); `engine/bidi.js` isolates every English run in RTL text (test: `tests/exp/bidi.mjs`); `engine/fig.js` full-screen figures with pinch-zoom; `engine/welcome.js` + `labs/site.js` (author, linkedin, goatcounter); `engine/stats.js` GoatCounter events (off while the code is empty).
  - `spice.js` the PC table (Exp 6, 8): LTspice-style schematic editor (grid, R C L D V GND, op amps, nmos4/pmos4, wires, labels, directives incl. K, .lib, .step, .tran, .dc, .op), simulator on the engine solver, and waveform viewer (click node / drag node→node / click part, zoom, Ctrl+E, average). An experiment with `pc:true` gets this app instead of the bench; `onRun(RT,res)` lets it compare a run with reference circuits given as SPICE text (`RT.sim(text)`).
  - `labs/index.js` is the lab registry (data only, all 13 EE labs): code, name, `level` (5–8 or `'elective'`), room `{rows, cols}`, experiments (`bench` instruments, `built`). `engine/registry.js` gives lookups and lazy loading of `labs/<lab>/exp<N>.js`. An experiment file registers `EXP_DEFS['<lab>/expN']` with: `procs` ([{id,title}], the Manual procedure picker; steps take their procedure from a leading "Procedure X", sheet sections from `data-proc`, grading rows from `grader.proc(p)`), `sheet` (HTML), `params`, `instruments`, `parts`, `tray`, `setup(RT)` → `{status, steps, onReset}`. Adding an experiment = one file + `built:true`; adding a lab = a folder `labs/<id>/` + one entry in `labs/index.js`.
- Built: all ten EE312 experiments (Exp 6 and 8 on the PC table). Questions found while building and the decisions taken: `docs/ee312/QUESTIONS.md`.
- Tests: `node tests/e2e.mjs [desktop,phone] [modules]` (Playwright; set `THREE_JS=/path/three.min.js` if cdnjs is blocked). Every experiment has a full Manual run with full-marks grading in `tests/exp/`; `tests/pc.mjs` drives the PC app.

## Experience (approved by the user — keep it)
1. **Hall (3D, Three.js r128):** first-person lab room with **all 10 EE312 experiments, every one of them built (no "coming soon")**: two rows of five tables, row 1 = Exp 1–5 and row 2 = Exp 6–10, in order. A hanging sign above every table shows the experiment number and name. Each table carries that experiment's real instruments in their real places.
   - Exp 6 and Exp 8 are LTspice experiments: their tables carry a PC. Sitting there opens a simulated LTspice-style schematic editor + simulator that follows the manual's procedure for that experiment step by step (place parts, wire, set .tran/.dc, run, probe nodes, read results), with the same Manual/Free modes and the same grading of the PLQ results.
   - Desktop: WASD/arrows to walk + **mouse-look like a game**: after the first click the pointer is locked and simply moving the mouse turns the view (no dragging); a small crosshair in the centre; click (or E) on the chair under the crosshair to sit; ESC releases the mouse. Phone: drag to look, tap floor to walk, tap a chair to walk to it.
   - Tapping the chair plays a sit-down animation, then a modal asks for the mode (below).
2. **Bench (2D SVG):** after sitting, the student sees the instruments in front of them, **arranged compactly around the breadboard** (no wide empty gaps, even when a table has many instruments like Exp 9) so the overview is readable without zooming. Everything works from the overview: buttons, knobs, terminals, cables and placing parts on the board. Tapping a device's body (not a control) zooms in **close: the device fills most of the screen (≈90 % of the width or height, whichever limits)** so every setting, label and screen value is easy to read and operate on a phone. While a device is zoomed, the parts box, hint bubbles and other instruments/board are hidden or pushed out of view; only the device, ✕ رجوع and its controls are shown. ✕ / ESC returns to the overview.
   - **Parts box (العلبة):** a side box that is open all the time next to the board; a small arrow at its bottom collapses/expands it. Its title is «العلبة» (not «الشنطة» / «القطع») with a small parts-box/tray icon (a little open box or basket, drawn as a simple SVG — not the 🎒 backpack emoji). Use «العلبة» everywhere in steps, hints and toasts.
   - **Default layout without crossings:** place the instruments around the board (left, top-left, top, top-right, right) so that each instrument's terminals/BNCs face the board, cables are short and do not cross each other or pass over other instruments. Check every experiment's default layout for crossings.
   - **Movable instruments:** every instrument has a small grab handle on top: the standard **four-way move icon** (a small circle/badge with arrows up, down, left, right, like the "move" cursor on websites) — **not** the ✋ emoji. Dragging it moves the instrument freely on the desk (cursor: `move`). The student's arrangement is remembered per experiment (localStorage), and a "ترتيب افتراضي" button restores the default layout. Moving an instrument never operates its controls.
   - **Cables follow the instrument like real leads:** a cable is a flexible lead whose two ends are glued to their jacks. It has **no fixed waypoints on the desk**: every frame it is re-drawn as one smooth sag curve straight from the instrument's jack to the board/terminal it is plugged into. When the instrument moves, the whole cable moves with it, stays the shortest natural path, gets longer only as far as the student drags the instrument away, and gets shorter again when brought back. It never keeps an old route, loops around the board or passes under/over another instrument because of where it used to be (bug seen on phone: after moving the scope down-left the CH cables still ran along their old path).
   - **Phone fit (still failing on a real iPhone — fix it for real):** on a phone (landscape and portrait) the bench overview must open **fitted to the instruments + board + lead tray** (their bounding box, small margin ≈4 %), filling the free area between the top bar, the parts box and the step card — not zoomed out with wide empty desk around it. Owner's screenshot (iPhone landscape, Exp 1 free mode): the instruments and board use barely half the height and ~60 % of the width, with empty desk all around. Measure the fit against the real visible area (`visualViewport`, safe-area insets, the Claude app's own top bar), recompute on resize/rotation and when the parts box collapses. The overview hint bubble («الأزرار شغّالة من هنا…») must not take space from the bench: show it once, small, then fade. Check every experiment at 844×390, 390×844, 932×430 and iPad, with screenshots, and make the instruments as large as the space allows.
   - **All leads start unplugged — the student connects everything:** no cable is pre-connected at the start (not the scope channels, generator output, supply, DMMs, transformer). All instrument leads lie in a **lead tray** on an empty part of the desk, labelled «Coaxial cables & wires»: each lead drawn as the real one (BNC→banana / alligator / mini-grabber coax for the scope channels and generator, red/black banana leads for the supply and DMMs) with its label (`CH1 probe`, `CH2 probe`, `GEN OUT`, `DC +`, `DC −`, `HI`, `COM` …). The student drags one end to the instrument jack/BNC and the other end to a board node; a plugged lead can be unplugged back to the tray. Manual steps include these connections explicitly (e.g. «وصّل CH1 probe: BNC في CH1 والطرف الأحمر على node 12 والأسود على node 18»), ticked from the real connection. The tray is part of the default layout (no crossings) and of the phone fit.
3. **Two modes only:**
   - **Manual mode (المانيوال):** follows the lab manual of that experiment step by step, with the manual's exact values. Each step is checked live from the simulated circuit and instrument state and ticks itself; a "show me" button zooms to the right device. The manual sheet (figures, captures, readings, questions) is filled and graded at the end.
   - **Free mode (حر):** the same table and instruments with no steps and no checks. The student builds any circuit from the bag and measures freely.

## Interaction details (user requirements)
- **Movement by device:** WASD/arrows only on laptop/desktop. On iPad and phone, the student walks by tapping the floor (no keyboard hints shown there).
- **When seated, everything is usable directly:** every button, knob, menu, terminal and part can be operated from the bench view.
- **Input highlight:** when the pointer is over (or a finger touches) an interactive element, it gets a clear white outline/glow so the student knows the input will go there. Non-interactive areas get no highlight.
- **Zoom by tapping the device body:** tapping a device anywhere that is not a control (its screen, its panel, its case) zooms the camera onto that device. Tapping/clicking a control operates it immediately — also from the overview — and never zooms. Mouse: hovering a control shows the white outline without clicking. Touch (phone/iPad): tap a control = it works; tap anywhere else on a device = zoom.
- **Cables:** draw them with a soft, subtle shadow. Every cable carries a small readable label for what it is, e.g. `CH1`, `CH2`, `GEN OUT`, `DC +`, `DC −`, `A`, `B`, `C`, placed near the plug and never overlapping other labels.
- **Cable colours:** wires on the board come uncoloured (neutral) by default, like in the lab. Colouring works like a paint program: a small **"لون السلك" toolbar** at the top of the bench with a bucket icon 🪣 and colour swatches (black, red, blue, grey, yellow, green). Pick a colour, then tap/click a wire to fill it; tap the bucket again (or ✕) to leave colour mode. This is the main way on phone/iPad; right-click on desktop may stay as a shortcut. **Instrument leads are not recolourable:** the coax/banana leads of the scope channels, generator, supply and DMM always keep their real colours — red for signal/+ and black for ground/−.
- **Steps and procedure text:** shown inside a clean, consistent rectangular card/panel: aligned edges, fixed padding, no overlap with instruments or other UI, no clipped text, proper RTL. The previous prototype had layout problems here; check every screen size.
- **Mixed Arabic + English must read in the right order — 100 % reliable, every experiment, every screen:** today English terms jump ahead of the Arabic around them (bidi reordering). Fix it at the root, not per string: the step card, the sheet, toasts and modals are `dir="rtl"`; every English/technical run (part names, values with units, node names, `CH1`, `Fig. 9.2a`, formulas, `V_CC`) is wrapped in an isolated LTR span (`<bdi>`/`unicode-bidi:isolate`, or a helper like `en()` used everywhere); numbers + units stay together (`2.7 kΩ`, `0.1 V`); punctuation stays on the Arabic side. Add a test that renders every step of every experiment and fails if an English run is not isolated.
- **Wiring steps must be clear like the manual:** every "build the circuit" step says exactly what goes where, one connection per line, in the manual's own names and in build order, e.g. "① BD137: E → node 12, C → node 14, B → node 13 · ② R_C = 2.7 kΩ بين node 14 و node 15 · ③ DC + (الوحدة اليسار) → node 15 …". Show the manual's figure next to the step (tap to enlarge, readable on phone), and highlight on the board the nodes the current line refers to. "وريني وين" highlights the exact holes/jacks, not only the device. A student who has never seen the circuit must be able to build it from the card alone.
- **Figures:** every figure in the sheet and in the steps is sharp and readable on phone (tap to open full-screen with pinch-zoom), never squeezed or cropped.
- **Component looks must match the real parts and the photos in `docs/`:** Zener drawn red as in the manual; silicon diode (e.g. 1N400x) black body with a grey cathode band; germanium diode in its small glass body with its band; LED as a 5 mm dome with two legs (longer anode); resistors with correct colour bands for their value; electrolytic capacitor with its polarity stripe. Cathode/polarity marks must be accurate because students learn orientation from them.

## Two bench multimeters
- Every EE312 table that has a DMM gets **two MCP MT3805 multimeters (DMM 1, DMM 2)**, as on the real lab benches, so two quantities can be read at the same time without moving leads (e.g. V_D and V_RS in Exp 1–2, V_GS/V_DS or V_RD in Exp 7, V_BE and V_O in Exp 9 A, the dc voltages in Exp 10 A). Steps and sheet say which meter reads what wherever the manual's figure shows two meters; where the manual measures one quantity, either meter is accepted. Update the default layouts (no crossings), the 3D tables and the tests.
- The owner confirms from the real lab: some measurements are taken with the two meters at the same time on two different points and the student reads the difference, so both meters must be usable together on the board.

## Diode test straight in the DMM jacks (Exp 1 Part A)
- In the real lab the students take the diode out and **plug its two legs straight into the DMM's input jacks** (HI V·Ω and COM) with the meter on the diode-test function, then flip it:
  - anode in HI, cathode in COM → forward reading (≈0.55 V 1N4001, ≈0.2–0.3 V Ge, ≈1.7–2 V green LED, Zener ≈0.7 V forward; the LED glows faintly);
  - reversed → the meter's overload/open reading exactly as the real MT3805 shows it (the owner remembers something like "OL"/"OVLD" — use the real display text).
- Build this: a diode can be dragged from the parts box (or lifted off the board) and dropped onto the DMM jack pair; it sits there drawn as the real part with its band showing which leg is where, a tap flips it, and a tap on "شيل" puts it back in the box. Measuring with the probe leads on the board stays possible too; the Manual steps for Part A use the jack method, like the lab.

## Welcome panel (first visit)
- When the site opens, a calm welcome card is shown over the corridor, centred, in this order (top to bottom):
  1. «أهلاً بك في محاكي معامل الهندسة الكهربائية» — the title, the largest text on the card.
  2. Under it, in small, light text (a short disclaimer, not alarming): «هذه المعامل مصممة لمحاكاة المعمل الأصلي، والأخطاء فيها واردة؛ فلا تعتمد عليها بشكل كامل، وإنما هي للتدريب فقط.»
  3. A "ابدأ" button closes it.
  - The du'a is **not** on the welcome card. It is written on the department sign at the corridor entrance (the first sign the student sees), as a small line under the department name: «أسأل الله لنا ولكم التوفيق والسداد».
  - Credit line (later, not now): when `author` in `labs/site.js` is filled, add under a thin divider, small and light grey: «تم التصميم من قبل <author>» with a small LinkedIn icon. While `author` is empty, no credit and no divider are shown.
- Shown on every new visit (or once per session); an ⓘ button in the corridor HUD re-opens it.
- The name and the LinkedIn URL come from one config object (`labs/site.js` or similar: `{author, linkedin}`) so the owner can change them without touching engine code. If `linkedin` is empty, show the name only (no link, no icon).
- Current values: `author: ''` (empty for now — the owner will add «عبدالرحمن القنيعة» later), `linkedin: 'https://www.linkedin.com/in/abdulrahman-algniah-3688673ab'`, `goatcounter: ''` (filled in when the owner creates the account).

## Usage statistics (anonymous)
- The owner wants numbers: visitors, experiments run, time spent. Use **GoatCounter** (free, no cookies, no personal data, CSV export). The script `https://gc.zgo.at/count.js` is the one allowed exception to "scripts only from cdnjs".
- The site code (e.g. `ee-labs`) lives in `labs/site.js` as `goatcounter: ''`. Empty = analytics off (also off on localhost, in tests and in the Claude preview). Never block or slow the site if the script fails to load.
- Count page views of the corridor, plus these events (path style, no names, no IDs):
  - `lab/<lab>` entering a lab room;
  - `exp/<lab>/expN/start/<manual|free>` sitting at a table and picking a mode;
  - `exp/<lab>/expN/done` all Manual steps ticked; `exp/<lab>/expN/graded/<0-49|50-79|80-99|100>` sheet graded (score bucket);
  - `time/<lab>/expN/<0-5|5-15|15-30|30-60|60+>min` time seated, sent once when the student stands up or leaves the page (`visibilitychange`/`pagehide`).
- No notice on the welcome card (the owner's decision): the counts are anonymous and aggregate only.

## Multi-lab building (plan for it now)
- Later the site will hold all EE labs (~8). The student will start in a **corridor of the EE department**, walk along it, and enter a lab through its **door** (a sign with the lab code, e.g. `EE312`, above each door). Entering a door loads that lab's room with its tables.
- Build the engine so this is only data, not new code:
  - a **lab registry** (`labs/index.js`): code, name, room layout (rows × tables), list of experiments;
  - the hall renders any lab room from its registry entry; the corridor renders one door per registered lab;
  - instruments are shared across labs (one scope/generator/DMM/supply implementation reused everywhere).
- Only `EE312` is built so far; the site opens in the corridor (below) and adding a lab = adding a folder `labs/<code>/` + its registry entry.

### The department corridor, ordered by study level (approved by the user)
- The site link opens in the **corridor** (not inside a lab). The student stands at its entrance looking down it.
- **Spawn point and sign spacing:** the student spawns a few metres before the first sign, so the department sign ("قسم الهندسة الكهربائية") stands clearly in front of him, fully readable and not overlapped by anything. The level signs come **one after another along the corridor with enough spacing** that, from the spawn point, they do not stack on top of each other or hide the department sign (today Level 5 hangs right under the department sign and Levels 6–7 pile up behind it). The student walks a short distance to reach Level 5 and its door, then on to the next level. Check the spawn view on desktop, phone landscape and portrait.
- Along the corridor, **hanging ceiling signs mark the levels**, spaced apart, in this order: `المستوى الخامس · Level 5` → `المستوى السادس · Level 6` → `المستوى السابع · Level 7` → `المستوى الثامن · Level 8`.
- After each level sign come the doors of that level's labs, **facing each other** on the left and right walls (one lab = one door; with an odd count the last door has no opposite). Each door has its own sign above it: code + English name + Arabic name, e.g. `EE312 · Basic Electronics Lab`.
- **Electives courtyard:** after Level 8 the corridor ends in a wide gateway with the sign `الاختيارية · Electives` that opens into a **large square courtyard (باحة)**, because the electives have many doors. The elective doors are spread evenly over its three walls — left, front, right (e.g. 7 doors → 2 left, 3 front, 2 right; 6 → 2/2/2; 8 → 3/2/3) — each with its own sign. The courtyard grows with the number of electives (computed from the registry). The courtyard has a **ceiling** like the corridor (same height and finish, with ceiling light panels) — it must never be open to the sky/void.
- In the middle of the courtyard stands a **"عد إلى المقدمة"** stand/button: tapping it takes the student back to the corridor entrance (short fade, no long walk).
- Labs not built yet: closed door with a "قريباً" plate; clicking/tapping it shows a toast, it does not open. Built labs: the door opens into the room; the room's exit door returns to the same spot in the corridor.
- The corridor is generated from the registry only: every entry has `level` (5, 6, 7, 8 or `'elective'`); the order inside a level is the order in `labs/index.js`. Adding a lab later never changes corridor code.
- Quick access (الوصول السريع) follows the same structure: **level → its labs → experiment** (e.g. المستوى الخامس shows one lab, EE210; المستوى السادس shows two, EE205 and EE312; الاختيارية shows the seven electives). Choosing a lab without an experiment jumps to its door; choosing an experiment goes straight to its table and sits. Unbuilt labs/experiments greyed out with "قريباً".
- **Lighting:** add soft, evenly spread light along the corridor and courtyard (ceiling light panels that look lit + a few cheap lights). Keep it light on the phone: prefer emissive ceiling panels, hemisphere/ambient light and a small number of real lights (no per-panel point lights, no real-time shadows from them); check the frame rate on the phone viewport stays smooth.
- Keep the corridor walk short enough on phone (tap-to-walk works along it; quick access is the shortcut).
- The department's labs (all go into the registry now; only EE312 is built):

| Level | Code | English name | الاسم |
|---|---|---|---|
| 5 | EE210 | Logic Design Lab | معمل التصميم المنطقي |
| 6 | EE205 | Electric Circuits Lab | معمل الدوائر الكهربائية |
| 6 | EE312 | Basic Electronics Lab | معمل أساسيات الإلكترونيات |
| 7 | EE302 | Modeling and Simulation Lab | معمل النمذجة والمحاكاة |
| 7 | EE357 | Microprocessors and Microcontrollers Lab | معمل المعالجات والحاكمات الصغرى |
| 8 | EE356 | Control and Measurements Lab | معمل التحكم والقياسات |
| Electives | EE402 | Electronic Circuits Lab | معمل الدوائر الإلكترونية |
| Electives | EE406 | VLSI Design Lab | معمل تصميم VLSI |
| Electives | EE421 | Communications Lab | معمل الاتصالات |
| Electives | EE433 | Electromechanical Energy Conversion Lab | معمل التحويل الكهروميكانيكي للطاقة |
| Electives | EE445 | Electric Power Lab | معمل القوى الكهربائية |
| Electives | EE457 | Applied Control Lab | معمل التحكم التطبيقي |
| Electives | EE459 | Advanced Logic Design Lab | معمل التصميم المنطقي المتقدم |

- Unbuilt labs get registry entries with `exps: []` (no room yet); their rooms are designed later from their own manuals in `docs/<lab>/`.

## Quick access (الوصول السريع)
- A "الوصول السريع" button is always visible in the hall (and reachable from the bench).
- It opens a three-level menu: level (المستوى الخامس … الثامن, الاختيارية) → that level's labs → the selected lab's experiments by number and name (Exp 1, Exp 2, …).
- Choosing an experiment takes the student straight to that table and plays the sit-down animation (no walking), then the mode modal.
- Experiments not built yet are shown greyed out with "قريباً".

## Accuracy and realism come first
- Instrument settings, ranges, units, menus, button behaviour and default/leftover states must match the real instruments and the manual.
- Circuit behaviour must be physically correct (real diode/Zener/capacitor models, loading, ripple, clipping levels). If unsure of a value, check the datasheet or ask; never guess.

## Real instruments (photos in `docs/ee312/instruments/`)
- Oscilloscope: **GW Instek GDS-1104B**, 4 channels (CH3 is needed in Exp 5). `scope-GW-Instek-GDS-1104B.png`, `scope-front-panel-labels.png`.
- Function generator: **PeakTech 4124** (two outputs CH1/CH2, F1–F5 keys, keypad, rotary knob — Exp 3 uses the knob to raise amplitude gradually). `function-generator-PeakTech-4124.png`.
- DC power supply: **TTi EL302RD dual power supply** — left and right units, each with VOLTS/AMPS displays, COARSE/FINE VOLTAGE and CURRENT knobs, CC lamp, − / + terminals and its own dc ON/OFF switch; one ~POWER ac switch. Both units are needed for bipolar ±15 V (Exp 5) and for two independent supplies (Exp 7, 9). The current single-unit supply in `index.html` must be replaced. `dc-supply-TTi-EL302RD.jpg`.
- Digital multimeter: **MCP MT3805** bench DMM (two per table — see "Two bench multimeters") — keys ·))) , diode, Hz, capacitance, Ω, ACV, DCV, ACI, DCI, RANGE ±/AUTO, HOLD, REL; jacks HI (V·Ω), LO/COM, A; open-circuit/diode readings like the real one (e.g. OL). `dmm-MCP-MT3805.jpg`, `dmm-MCP-MT3805-measure-VAB.jpg`.
- Center-tapped transformer (A, B = center tap, C) for Exp 4.
- Two resistance decade boxes for Exp 9 Procedure B.
- Plug-in panel (nine-hole nodes + bridging plugs) and coaxial cables (BNC to banana / alligator / mini-grabber). `plug-in-panel.png`, `coaxial-cables.png`.
- Diode looks: `diodes-fig1.2.png` (from right: green LED, Ge diode glass with bands, red Zener, black rectifier with grey band).
- Full per-experiment plan (parts, values, procedure, results): `docs/ee312/PLAN.md`.

## Procedure picker in Manual mode (all labs, EE312 included)
- After choosing Manual, a small card lists the experiment's procedures (Procedure I, II, III, IV … with their titles) as a multi-select checklist, all ticked by default, with a note: «بعض الـ Procedures ممكن تكون محذوفة في ترمك، تأكد من دكتور المعمل واختر اللي مطلوبة منك».
- The student can tick any combination (e.g. I + III). Steps run procedure by procedure in order: when Procedure I is done a short "خلصت Procedure I ← ننتقل لـ Procedure III" card appears, then the next one starts. After the last selected one: the sheet (only the selected procedures' tables/questions) is filled and graded, then «قم من الطاولة».
- Unselected procedures are skipped in steps, sheet and grading. The step counter and progress show per procedure.
- Instruments can differ per procedure (EE205 Exp 1: Proc I uses three handheld meters, later procedures another set): an experiment file may give each procedure its own instrument list; the bench swaps them when the procedure changes.

## Tables per lab
- Every lab room has exactly one table per experiment, in manual order (10, 8, 6 …).

## Manual first, videos only for looks (owner's rule, all labs)
- The lab videos are ~12 years old; the manual is current and is what the course uses. The manual always wins.
- Anything in the manual (procedures, parts, values, instruments, steps, tables) MUST be in the site. Anything that appears only in the videos and not in the manual is dropped.
- Videos/photos are used only for what the manual does not say: the real look/model of each instrument, where things sit on the table, which meter (e.g. GoldStar for small currents), typical readings to sanity-check the solver.

## Pre-launch validation (before sharing the link with students)
1. Reference check per experiment: run every Manual procedure with the manual's values and compare every table cell the solver produces with (a) the hand calculation / theory (b) the real readings we have (EE312 report, EE205 video readings). Write docs/<lab>/VALIDATION.md: value, expected, simulated, % difference, pass/fail (tolerance per quantity, e.g. ±5 % for passives, ±10 % for semiconductors).
2. Robustness sweep: automated random/edge actions on every bench — reversed polarity, open/short circuits, every knob at min/max, every scope/DMM range and function, meter on the wrong function (e.g. current jack across a supply → blown fuse), parts removed mid-run, rapid mode switching. Pass = no console error, no NaN/Infinity on any display, realistic failure behaviour (OL, fuse, clipping, CC lamp).
3. Device matrix: desktop Chrome/Safari/Firefox, iPhone Safari, Android Chrome, iPad; landscape + portrait; frame rate in the hall on phone.
4. Report a short list of anything that failed or looks unrealistic; fix, re-run.
- Add `<meta name="robots" content="noindex,nofollow">` and a robots.txt disallow so the site stays out of search engines (department-only sharing).

## Progress file
- Keep `docs/PROGRESS.md` (done / in progress / next) updated and commit + push after every finished item, so a new session can resume exactly where the last one stopped if usage runs out.

## Hard rules
- Instruments must look and behave like the real lab ones listed above. Same buttons, menus, units and limits. Devices start with the "previous group's" leftover settings like the real lab.
- Parts always sit between two adjacent nodes of the plug-in panel (fixed spacing). Polarity matters (diodes, Zener, electrolytic caps); wrong wiring must fail like in reality (clipped/odd waveform, blown fuse, exploded capacitor).
- Results come from the circuit solver, never hard-coded waveforms.
- Language: explanations, guidance and step text in Saudi Arabic; instruments, manual text, figures, units and technical terms in English. Arabic text must read right-to-left with English terms inline.
- Must work on phone, iPad and desktop. Phone landscape is the main mobile target.
- Light, calm visual style (sage walls, light desk, off-white instruments). One self-hosted static site; external scripts only from cdnjs.

## Workflow
- One experiment per session. Before coding, read its pages in `docs/`, list the instruments, values, steps and questions you found, and wait for the user's OK.
- After building, test in a headless browser (desktop + phone viewport): no console errors, practice steps all tick when done correctly, exam grading gives full marks for a correct run.
- Commit with a clear message per experiment.
