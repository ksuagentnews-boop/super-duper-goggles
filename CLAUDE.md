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
  - Instruments: `scope.js` (GDS-1104B, 4 channels), `gen.js` (PeakTech 4124), `psu.js` (TTi EL302RD, two units, per-experiment knob resolution), `dmm.js` (MCP MT3805), `xf.js` (center-tapped transformer), `dbox.js` (two resistance decade boxes).
  - `board.js` bench runtime (default layout from where each instrument's terminals face — top row / left / right of the panel, no crossings, `RT.crossings()` checks it; movable instruments with a ✋ handle, arrangement saved per experiment in localStorage, `ترتيب افتراضي` restores it; plug-in panel, two-leg parts and multi-pin parts — DIP-8 op amp, TO-220 / TO-126 transistors — with real looks, cables with labels / shadow / colour menu, hover glow, netlist, analysis, LEDs that blink with slow signals), `bench.js` shell (zoom, bag drawer, stepper, Manual/Free; PC tables), `hall.js` 3D scenes (corridor with one door per lab; any lab room built from its registry entry, with signs and an exit door), `quick.js` الوصول السريع.
  - `spice.js` the PC table (Exp 6, 8): LTspice-style schematic editor (grid, R C L D V GND, op amps, nmos4/pmos4, wires, labels, directives incl. K, .lib, .step, .tran, .dc, .op), simulator on the engine solver, and waveform viewer (click node / drag node→node / click part, zoom, Ctrl+E, average). An experiment with `pc:true` gets this app instead of the bench; `onRun(RT,res)` lets it compare a run with reference circuits given as SPICE text (`RT.sim(text)`).
  - `labs/index.js` is the lab registry (data only): code, name, room `{rows, cols}`, experiments (`bench` instruments, `built`). `engine/registry.js` gives lookups and lazy loading of `labs/<lab>/exp<N>.js`. An experiment file registers `EXP_DEFS['<lab>/expN']` with: `sheet` (HTML), `params`, `instruments`, `parts`, `tray`, `setup(RT)` → `{status, steps, onReset}`. Adding an experiment = one file + `built:true`; adding a lab = a folder `labs/<id>/` + one entry in `labs/index.js`.
- Built: all ten EE312 experiments (Exp 6 and 8 on the PC table). Questions found while building and the decisions taken: `docs/ee312/QUESTIONS.md`.
- Tests: `node tests/e2e.mjs [desktop,phone] [modules]` (Playwright; set `THREE_JS=/path/three.min.js` if cdnjs is blocked). Every experiment has a full Manual run with full-marks grading in `tests/exp/`; `tests/pc.mjs` drives the PC app.

## Experience (approved by the user — keep it)
1. **Hall (3D, Three.js r128):** first-person lab room with **all 10 EE312 experiments, every one of them built (no "coming soon")**: two rows of five tables, row 1 = Exp 1–5 and row 2 = Exp 6–10, in order. A hanging sign above every table shows the experiment number and name. Each table carries that experiment's real instruments in their real places.
   - Exp 6 and Exp 8 are LTspice experiments: their tables carry a PC. Sitting there opens a simulated LTspice-style schematic editor + simulator that follows the manual's procedure for that experiment step by step (place parts, wire, set .tran/.dc, run, probe nodes, read results), with the same Manual/Free modes and the same grading of the PLQ results.
   - Desktop: WASD/arrows to walk + **mouse-look like a game**: after the first click the pointer is locked and simply moving the mouse turns the view (no dragging); a small crosshair in the centre; click (or E) on the chair under the crosshair to sit; ESC releases the mouse. Phone: drag to look, tap floor to walk, tap a chair to walk to it.
   - Tapping the chair plays a sit-down animation, then a modal asks for the mode (below).
2. **Bench (2D SVG):** after sitting, the student sees the instruments in front of them, **arranged compactly around the breadboard** (no wide empty gaps, even when a table has many instruments like Exp 9) so the overview is readable without zooming. Everything works from the overview: buttons, knobs, terminals, cables and placing parts on the board. Tapping a device's body (not a control) zooms in moderately (the device plus a little context, not filling the whole screen). ✕ / ESC returns.
   - **Parts box:** a side box that is open all the time next to the board; a small arrow at its bottom collapses/expands it.
   - **Default layout without crossings:** place the instruments around the board (left, top-left, top, top-right, right) so that each instrument's terminals/BNCs face the board, cables are short and do not cross each other or pass over other instruments. Check every experiment's default layout for crossings.
   - **Movable instruments:** every instrument has a small grab handle on top (a hand ✋ / move icon). Dragging it moves the instrument freely on the desk (the cursor shows a grab/grabbing hand). Cables stay attached at both ends and re-route smoothly as the instrument moves (natural curve, no fixed long loops); a cable only gets long if the student moves things far apart. The student's arrangement is remembered per experiment (localStorage), and a "ترتيب افتراضي" button restores the default layout. Moving an instrument never operates its controls.
3. **Two modes only:**
   - **Manual mode (المانيوال):** follows the lab manual of that experiment step by step, with the manual's exact values. Each step is checked live from the simulated circuit and instrument state and ticks itself; a "show me" button zooms to the right device. The manual sheet (figures, captures, readings, questions) is filled and graded at the end.
   - **Free mode (حر):** the same table and instruments with no steps and no checks. The student builds any circuit from the bag and measures freely.

## Interaction details (user requirements)
- **Movement by device:** WASD/arrows only on laptop/desktop. On iPad and phone, the student walks by tapping the floor (no keyboard hints shown there).
- **When seated, everything is usable directly:** every button, knob, menu, terminal and part can be operated from the bench view.
- **Input highlight:** when the pointer is over (or a finger touches) an interactive element, it gets a clear white outline/glow so the student knows the input will go there. Non-interactive areas get no highlight.
- **Zoom by tapping the device body:** tapping a device anywhere that is not a control (its screen, its panel, its case) zooms the camera onto that device. Tapping/clicking a control operates it immediately — also from the overview — and never zooms. Mouse: hovering a control shows the white outline without clicking. Touch (phone/iPad): tap a control = it works; tap anywhere else on a device = zoom.
- **Cables:** draw them with a soft, subtle shadow. Every cable carries a small readable label for what it is, e.g. `CH1`, `CH2`, `GEN OUT`, `DC +`, `DC −`, `A`, `B`, `C`, placed near the plug and never overlapping other labels.
- **Cable colours:** cables come uncoloured (neutral) by default, like in the lab. Right-click on a cable (long-press on touch) opens a small colour menu so the student can colour it.
- **Steps and procedure text:** shown inside a clean, consistent rectangular card/panel: aligned edges, fixed padding, no overlap with instruments or other UI, no clipped text, proper RTL. The previous prototype had layout problems here; check every screen size.
- **Component looks must match the real parts and the photos in `docs/`:** Zener drawn red as in the manual; silicon diode (e.g. 1N400x) black body with a grey cathode band; germanium diode in its small glass body with its band; LED as a 5 mm dome with two legs (longer anode); resistors with correct colour bands for their value; electrolytic capacitor with its polarity stripe. Cathode/polarity marks must be accurate because students learn orientation from them.

## Multi-lab building (plan for it now)
- Later the site will hold all EE labs (~8). The student will start in a **corridor of the EE department**, walk along it, and enter a lab through its **door** (a sign with the lab code, e.g. `EE312`, above each door). Entering a door loads that lab's room with its tables.
- Build the engine so this is only data, not new code:
  - a **lab registry** (`labs/index.js`): code, name, room layout (rows × tables), list of experiments;
  - the hall renders any lab room from its registry entry; the corridor renders one door per registered lab;
  - instruments are shared across labs (one scope/generator/DMM/supply implementation reused everywhere).
- For now there is only `EE312`: the site can open straight into its room, but the corridor/door scene and the registry must already exist so adding a lab = adding a folder `labs/<code>/` + one registry entry.

### The department corridor, ordered by study level (approved by the user)
- The site link opens in the **corridor** (not inside a lab). The student stands at its entrance looking down it.
- Along the corridor, **hanging ceiling signs mark the levels**, spaced apart, in this order: `المستوى الخامس · Level 5` → `المستوى السادس · Level 6` → `المستوى السابع · Level 7` → `المستوى الثامن · Level 8`.
- After each level sign come the doors of that level's labs, **facing each other** on the left and right walls (one lab = one door; with an odd count the last door has no opposite). Each door has its own sign above it: code + English name + Arabic name, e.g. `EE312 · Basic Electronics Lab`.
- **Electives courtyard:** after Level 8 the corridor ends in a wide gateway with the sign `الاختيارية · Electives` that opens into a **large square courtyard (باحة)**, because the electives have many doors. The elective doors are spread evenly over its three walls — left, front, right (e.g. 7 doors → 2 left, 3 front, 2 right; 6 → 2/2/2; 8 → 3/2/3) — each with its own sign. The courtyard grows with the number of electives (computed from the registry).
- In the middle of the courtyard stands a **"عد إلى المقدمة"** stand/button: tapping it takes the student back to the corridor entrance (short fade, no long walk).
- Labs not built yet: closed door with a "قريباً" plate; clicking/tapping it shows a toast, it does not open. Built labs: the door opens into the room; the room's exit door returns to the same spot in the corridor.
- The corridor is generated from the registry only: every entry has `level` (5, 6, 7, 8 or `'elective'`); the order inside a level is the order in `labs/index.js`. Adding a lab later never changes corridor code.
- Quick access (الوصول السريع) follows the same structure: **level → its labs → experiment** (e.g. المستوى الخامس shows one lab, EE210; المستوى السادس shows two, EE205 and EE312; الاختيارية shows the seven electives). Choosing a lab without an experiment jumps to its door; choosing an experiment goes straight to its table and sits. Unbuilt labs/experiments greyed out with "قريباً".
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
- Digital multimeter: **MCP MT3805** bench DMM — keys ·))) , diode, Hz, capacitance, Ω, ACV, DCV, ACI, DCI, RANGE ±/AUTO, HOLD, REL; jacks HI (V·Ω), LO/COM, A; open-circuit/diode readings like the real one (e.g. OL). `dmm-MCP-MT3805.jpg`, `dmm-MCP-MT3805-measure-VAB.jpg`.
- Center-tapped transformer (A, B = center tap, C) for Exp 4.
- Two resistance decade boxes for Exp 9 Procedure B.
- Plug-in panel (nine-hole nodes + bridging plugs) and coaxial cables (BNC to banana / alligator / mini-grabber). `plug-in-panel.png`, `coaxial-cables.png`.
- Diode looks: `diodes-fig1.2.png` (from right: green LED, Ge diode glass with bands, red Zener, black rectifier with grey band).
- Full per-experiment plan (parts, values, procedure, results): `docs/ee312/PLAN.md`.

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
