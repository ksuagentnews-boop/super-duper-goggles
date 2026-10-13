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
