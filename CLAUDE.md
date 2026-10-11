# EE Labs Simulator — محاكي معامل قسم الكهرباء

A static website (GitHub Pages, no server, no login) that simulates the EE department labs at King Saud University as a reference for students. Start: EE312 (Basic Electronics Lab). Later: ~8 labs × ~10 experiments.

## Source of truth
- `docs/<lab>/` holds the lab manual and slides (PDF/images). Every experiment MUST match them exactly: same instruments, same component values, same procedure steps, same figures, same questions.
- If the manual and these rules disagree, follow the manual and tell the user.
- Never invent instruments, values or steps. If something is missing from the docs, ask.

## Current state
- `index.html` is the working prototype (Exp 3 and Exp 4 of EE312). Its scope, generator, transformer, circuit solver and interactions are approved: reuse them, do not redesign them. Known gaps: single-unit DC supply (replace with the EL302RD), no DMM, scope CH3/CH4 unused, and its Exp 3 circuit came from an old exam — rebuild Exp 3 from the manual (Fig. 3.4a/b).
- First task: split `index.html` into a clean structure without changing behaviour:
  - `engine/` shared code: hall (3D), bench shell (zoom, bag drawer, stepper), instruments, breadboard, circuit solver.
  - `labs/ee312/exp3.js`, `exp4.js`, … one file per experiment (circuit reference, steps, exam sheet, grading, randomization).
  - Adding a new experiment should only mean adding one file in `labs/<lab>/` and one entry in a registry.

## Experience (approved by the user — keep it)
1. **Hall (3D, Three.js r128):** first-person lab room with **all 10 EE312 experiments, every one of them built (no "coming soon")**: two rows of five tables, row 1 = Exp 1–5 and row 2 = Exp 6–10, in order. A hanging sign above every table shows the experiment number and name. Each table carries that experiment's real instruments in their real places.
   - Exp 6 and Exp 8 are LTspice experiments: their tables carry a PC. Sitting there opens a simulated LTspice-style schematic editor + simulator that follows the manual's procedure for that experiment step by step (place parts, wire, set .tran/.dc, run, probe nodes, read results), with the same Manual/Free modes and the same grading of the PLQ results.
   - Desktop: WASD/arrows to walk + mouse drag to look. Phone: drag to look, tap floor to walk, tap a chair to walk to it.
   - Tapping the chair plays a sit-down animation, then a modal asks for the mode (below).
2. **Bench (2D SVG):** after sitting, the student sees the instruments in front of them. Tap a device → camera zooms on it (focus view). ✕ / ESC returns. Tapping the breadboard gives the top view; a bag button on the left opens the parts drawer over the bottom quarter of the screen.
3. **Two modes only:**
   - **Manual mode (المانيوال):** follows the lab manual of that experiment step by step, with the manual's exact values. Each step is checked live from the simulated circuit and instrument state and ticks itself; a "show me" button zooms to the right device. The manual sheet (figures, captures, readings, questions) is filled and graded at the end.
   - **Free mode (حر):** the same table and instruments with no steps and no checks. The student builds any circuit from the bag and measures freely.

## Interaction details (user requirements)
- **Movement by device:** WASD/arrows only on laptop/desktop. On iPad and phone, the student walks by tapping the floor (no keyboard hints shown there).
- **When seated, everything is usable directly:** every button, knob, menu, terminal and part can be operated from the bench view.
- **Input highlight:** when the pointer is over (or a finger touches) an interactive element, it gets a clear white outline/glow so the student knows the input will go there. Non-interactive areas get no highlight.
- **Zoom by tapping the device body:** tapping a device anywhere that is not a control (its screen, its panel, its case) zooms the camera onto that device. Tapping a control operates it and never zooms.
- **Cables:** draw them with a soft, subtle shadow. Every cable carries a small readable label for what it is, e.g. `CH1`, `CH2`, `GEN OUT`, `DC +`, `DC −`, `A`, `B`, `C`, placed near the plug and never overlapping other labels.
- **Cable colours:** cables come uncoloured (neutral) by default, like in the lab. Right-click on a cable (long-press on touch) opens a small colour menu so the student can colour it.
- **Steps and procedure text:** shown inside a clean, consistent rectangular card/panel: aligned edges, fixed padding, no overlap with instruments or other UI, no clipped text, proper RTL. The previous prototype had layout problems here; check every screen size.
- **Component looks must match the real parts and the photos in `docs/`:** Zener drawn red as in the manual; silicon diode (e.g. 1N400x) black body with a grey cathode band; germanium diode in its small glass body with its band; LED as a 5 mm dome with two legs (longer anode); resistors with correct colour bands for their value; electrolytic capacitor with its polarity stripe. Cathode/polarity marks must be accurate because students learn orientation from them.

## Quick access (الوصول السريع)
- A "الوصول السريع" button is always visible in the hall (and reachable from the bench).
- It opens a two-level menu: first the list of labs (for now only `EE312`; other labs appear later from the registry), then the selected lab's experiments by number and name (Exp 1, Exp 2, …).
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
