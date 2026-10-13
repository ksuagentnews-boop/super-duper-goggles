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
