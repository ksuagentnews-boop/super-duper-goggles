# EE205 · Questions and decisions

Small gaps resolved while building (the manual always wins; videos only for looks).

## Instruments
- **YEW 2786 tolerances** are read from the lab photo: ×1 ±0.5 % (the manual's own example), ×10 ±0.2 %, ×100 and ×1k ±0.05 %, ×10k and ×100k ±0.1 %. Dials go 0 … 10.
- **Metrix MTX 3240** key legends in the right-hand column cannot be read in the photos; the generator keeps FREQ / AMPL / OFFSET / DUTY, the three waveforms and OUTPUT ON, the rest is drawn only.
- **Handheld meters:** the GoldStar's mA input shares the V·Ω jack (as on the DM-33x); its 40 mA range has a 5 Ω shunt, 400 mA 0.5 Ω. The Fluke 77 mA jack is 1.8 Ω. These burdens are typical, not from a datasheet.

## Exp 1
- The three "colour code resistors" of Procedure I are not named: 330 Ω, 6.8 kΩ and 56 kΩ (5 %, gold band) are used.
- Procedure IV's "simulated" values: the bench has no PSpice; the sheet asks for the calculated values.
- Procedure III with one ammeter (the GoldStar, as in the lab video): each branch is joined to the bus by a bridging plug, and the ammeter takes the plug's place for each current in turn.
- Procedure IV: ID ≈ 44 mA is above the GoldStar's 40 mA range, so the step uses its 400 mA position.

## Exp 2
- Procedure I's sine (steps 4–7) has no values in the manual: 1 kHz, 4 Vpp is used.
- e(t) = 10 sin(2π·10³t) is set as 20 Vpp on the generator (its open-circuit EMF); E under load is what the DMM measures.
- Fig. 3's caption says "procedure II": it is the circuit of Procedure III (PLAN decision).
- The current of Procedure III is measured by putting the Fluke (A~, 300 mA jack) in place of a bridging plug between the generator and the coil.
- The decade box of the equipment list stands on the table; no step of the procedures uses it.
- On the HM 203-7, DUAL and ADD pressed together give CHOP; the ADD step asks to release DUAL first.

## Exp 3
- "5 V" is 5 V rms of the generator (AMPL = 14.14 Vpp): with it Va-b at 0.47 µF is 1.61 V, the video's 1.606 V.
- ZTH "by shorting the supply" is calculated; the generator's 50 Ω may be included or not (both graded right).
- Fig. 6b's ZTH is built as the decade box (real part − RL ≈ 767 Ω) in series with the same iron-core coil.
- The 4.7 µF and 22 µF capacitors are treated as non-polar (ac across them).
- Two yellow-holster Fluke 77s as on the table photo: M1 voltmeter, M2 ammeter (A~, 300 mA jack in place of a plug).

## Exp 6
- Rs = 50 Ω (the MTX 3240 output); τ = (R + Rs)C. In Procedure II the coil's RL = 17.6 Ω adds to R as well.
- Table 1's six times are the student's own choice (any six inside half a period); each row is graded against the theory at that time.
- The "overshoot just vanishes" point is graded against where the student saw it (overshoot < 1 % of the step, i.e. invisible at 2 V/div), and Rc against 2√(L/C).

## Exp 8
- Procedures I–II give no source values: E = 2 Vrms at 1 kHz. The video's Procedure II readings (IR 20.17, I 48.1, IC 60.9 mA) are what 2 Vrms at 1 kHz gives.
- The handheld voltmeter cannot follow 7.5–15 kHz, so in Procedures III–IV V = 2 Vrms is held with the CRO (5.66 Vpp); the BK 2704B ammeter reads flat at these frequencies, as the lab's did (video: 18.06 mA at series resonance). "V = 2 Vrms" is checked within ±2.5 % (the ammeter's burden moves it a little).
- Coil resistances: 1000 turns 17.6 Ω, 500 turns 5.2 Ω (videos). The 1 µF capacitor of the list is in «العلبة»; no step uses it.
- Off resonance the parallel current is above the BK's 2 mA range: the student moves to 20 mA (OL otherwise), as on the real meter.

## Exp 7
- The coils on the U-core: coil 1 (1000 turns) Rdc 17.6 Ω, L1 = 1.715 H; coil 2 (500 turns) Rdc 5.2 Ω, L2 = 0.429 H; M = 0.781 H (k = 0.91), fitted to the lab video at 5 V (I1 7.76 mA, V2 2.285 V, VT = 7.5 V → dot at B). The dot is not drawn on the part: Procedure III finds it.
- "R = 1.15 Rdc" is the manual's allowance; the simulated coils have their dc resistance only (R ≪ X, so L changes by < 0.1 %).
- Four Fluke 77s (M1–M3 voltmeters, M4 ammeter) instead of the list's two ammeters + three voltmeters: no step needs a second ammeter, and the desk stays readable (the table photo shows three meters).
- 2 Vrms (manual), not the video's 5 V. The variable ac supply is locked until «المشرف يتأكد» checks the wiring (no ammeter across the source, no short); any wiring change re-locks it.

## Exp 4
- The lamp + ballast is modelled as a linear R + L load (R = 263 Ω, L = 0.931 H: 22 W, PF 0.60 lagging, 0.29 A at 127 V), so the minimum current (PF = 1 at 4.84 µF) falls inside the table's 1–6 µF, as the manual's table implies. A real tube's harmonics are not modelled.
- Source: the bench outlet at 127 V 60 Hz (PLAN). Switch S = the bridging plug joining the capacitor box to the load; dials at 0 = "C not connected".

## Exp 5
- One PX 120 on the table: the list says two wattmeters, but the second one belongs to the two-wattmeter method of the background; no procedure uses it.
- Five Fluke 77s as the three ac ammeters and two ac voltmeters of Fig. 7 (M5 is also the ohmmeter that sets the rheostats to 100 Ω).
- The transformer's star point is inside it: Fig. 7 and Fig. 9 are three-wire (n not wired), Fig. 8 joins the transformer's n to the load's n.

## Batch 5 (redraws, 14 Oct)
- **Three-phase transformer, socket names:** the L1 / L2 / L3 / N prints under the sockets are too blurry in every photo to read with certainty; drawn as top L1, bottom-right L2, bottom-left L3, N inside on both triangles. A close straight-on photo of the panel would settle it. The rating's first line reads «4 A» with a small mark after it, drawn as the star sign ⅄ (pairs with «2.3 A Δ»).
- **Three-phase transformer, rocker:** the owner's note said "black rocker"; the photos show a white rocker in a black frame. Drawn as the photos.
- **Hameg colours:** the reference photo and the lab unit differ in key and knob colours (lab: black keys, dark grey knobs, blue LEVEL, black dial skirts). Drawn as the lab unit; layout and labels from the reference photo. The lab's BNC→banana adaptors on CH I / CH II are not drawn (the coax lead plugs into the BNC).
- **Rheostats:** the lab's end panels show no black round element top-left (the ref photo's newer print has one); drawn as the lab units: red socket at the top, the round recessed element in the middle.
- **Variable ac supply:** its dc output (blue − / red +) is drawn but does not take leads: no EE205 experiment uses it, and the rectified output would need a non-linear (transient) solve on this bench. The knob range is now 0 … 20 V as printed (was 24 V).
- **Exp 4 wall socket:** the owner says the lamp fixture's plug goes straight into the wall socket, but Fig. 4 puts the PX 120 current coil and the ammeter in series between the source and the lamp. Drawn: the wall socket with the lab's black mains lead (its plug goes into the outlet; it ends in L / N 4 mm sockets), from which the banana leads build Fig. 4 on the panel. Plugging in = energizing (after the instructor's check in Manual).

## Batch 6 (steps follow the manual, circuits by equivalence)
- Exp 4: switch S is a bridging plug present in Fig. 4 from the start; "C not connected" = capacitor box at 0 (open), so the circuit does not change after the instructor's check. The PX 120 voltage + is on the source side of the current coil (both + at L1 in the figure). Step 4 "increase C in steps" = the table rows 2.0, 3.0, 3.2 … 6.0 µF. The old "unplug" step is dropped (not in the manual).
- Exp 5: Fig. 8 wattmeter voltage + on line A. Fig. 9 (scan unclear: voltage leads seem to go to B and C) keeps the PX 120 3Φ model: current + from A, voltage + on A, com on B; no ammeter, no neutral wire. Ammeters M1–M3 fixed to lines A, B, C and rheostats R1–R3 to a, b, c. The invented "transformer off" step is dropped.
- Exam score = the experiment's graded sheet items; «وصّل لي» / «تخطّي» −1, «تلميح» −0.5.
- Exp 1: Proc I step 3 says "record in table 2" but the tolerance column is in Table 3 (Table 3 used). Figs. 7 and 8 draw I_D / I_Y on the source line, so the GoldStar ammeter is part of those figures. The old "turn everything off" steps are dropped (not in the manual).
- Exp 2: Fig. 3 includes the Fluke across R (V_R, the last of the step's three readings); Proc III steps 3 (DUAL) and 4 (Lissajous) are captured into two new figure slots of the sheet.
- Exp 3: the meters drawn in Figs. 6a, 6b, 7 (V_R, I_R, V_a-b) are part of the figures; "isolate the 10 kΩ" = take out the load branch (10 kΩ and M2); Fig. 7 is built with the first capacitor of Table 1.
- Engine note: a handheld meter's VΩ lead counts as part of the circuit (it sources current on Ω), so a voltmeter not drawn in a figure makes it not match; the measurement set-ups are therefore figures of their own (Exp 1 `ohm`, `V1`; Exp 2 `I`).
- Exp 6: Manual Capture reads v_c at 0.1, 0.25, 0.5, 0.75, 1, 1.5 ms after the edge (time cells filled too); τ read at 6.32 V (charging) / 3.68 V (discharging); three screen slots (under / critical / over damped) added to the Proc II sheet. The manual has no Proc II step 2.
- Exp 7: the coils go on the board in step I.1; only the first build has its own instructor-check step (later power-ons ask for the check in the step card); 7b = "repeat for coil 2", 10b = the opposing connection of step IV.4; Rdc may be read with any meter.
- Exp 8: Figs. 6 and 7 draw no meters but step 1 measures E and I, so Fig. 6 includes the BK in series and the Fluke across E; in Fig. 7 the BK takes each plug's place in turn; for θ a 10 Ω goes between the bottom bus and ground; Fig. 7cl (step II.4) = Fig. 7 plus the manual's hint; in Proc III/IV V is held with CH I (no Fluke on those tables). Fixed: the Table 2 grader read p<f> instead of the sheet's q<f>.
- Batch 7: the instructor check is its own sub-step (chk:true); its button shows only from that sub-step on (Exp 4, 5). "Do it for me" that moves a meter's leads on the EE205 boards (rheostats, loads as leads) rebuilds the whole figure in the reference layout (Exp 5 step 2: figures 7b, 7c with M5 on b–n and c–n).
- Batch 7 Exp 2: I.5 uses 1 V/div and 0.2 ms/div as the example of "one or two complete waves"; I.1 c) moves Y-POS I and brings it back to the centre. Exp 3 I.4: the decade box shows ≈ 767 Ω. "Do it for me" for a meter on a part-less set-up (Fluke on the generator, ohmmeter on the decade box alone) rebuilds the set-up.
