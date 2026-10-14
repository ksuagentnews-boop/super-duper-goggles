# Hameg HM 203-7: front-panel notes (batch 5, item 4)

Sources: the owner's straight-on photo `ref/hameg-hm203-7.jpg` (layout, every label), the lab crop `crops/hameg-hm203-7.jpg`
(colours of the lab's unit) and the HM 203 / HM 303 manuals (control functions). Real front ≈ 285 × 145 mm (2 : 1).
Panel coordinates below are the drawing's units (760 × 380, 1 unit ≈ 0.375 mm), measured from the ref photo.

## What differs between the ref photo and the lab's unit (lab wins)
| Element | Ref photo | Lab unit (drawn) |
|---|---|---|
| Push keys | light beige | black |
| X-POS, HOLD OFF, Y-POS I/II knobs | light grey | dark grey |
| LEVEL knob | light grey | blue |
| TIME/DIV, VOLTS/DIV skirts | light grey, red cap | black skirt, white ring, red cap |
| INTENS / FOCUS | green | green |
| CH I / CH II inputs | bare BNC | BNC (the lab adds BNC→banana adaptors; on the bench the coax lead plugs straight into the BNC) |

## Case and screen (left half)
- Beige-grey case, rounded; carrying handle / tilt stand under the case (drawn as the stand's two arms, not on the panel).
- Raised beige CRT bezel 21…375 × 12…299 with rounded corners and a darker inner step.
- CRT face (teal-green when off, as in both photos) 52…334 × 46…276: internal graticule 10 × 8 div with dark lines, 5 sub-ticks on
  the centre lines, dotted 0 % / 100 % rise-time lines.
- Bottom strip (y 304…373), left to right:
  - label plate: «HAMEG» logo (black outlined letters), «20 MHz Oscilloscope», «HM 203-7»;
  - X-MAG. key with «x10» under it (grey field);
  - CAL. output: two metal contacts, «0.2 V» and «2 V» with the ⎍ square-wave mark (grey field);
  - COMPONENT TESTER: key + 4 mm jack in a framed field, «COMPONENT» above, «TESTER» below.

## Upper right block (beam, time base, trigger) 387…752 × 12…197
- POWER: «POWER on/off» + ⚠ label, red key, yellow lamp to its right.
- X-Y key (label «X-Y» above).
- Light recess: INTENS. (green knob, label under), TR (red screwdriver hole, label above), FOCUS (label above, green knob).
- X-POS. knob in a grey field; HOLD OFF knob with a curved arrow mark at its left.
- TV SEP. slide switch: OFF / TV:H / TV:V (labels at its left).
- TRIG. lamp (green window) with «TRIG.» to its right.
- Trigger coupling slide switch: AC / DC / HF / LF / ~ (labels at its left).
- TIME/DIV.: grey rounded dial field; scale clockwise 100 50 20 10 5 2 1 .5 .2 .1 (ms) 50 20 10 5 2 1 .5 .2 (µs),
  «ms» / «µs» marks, «V» (TV:V) and «H» (TV:H) marks; skirt knob with the red VAR cap; «ms ⊳CAL. µs» under it.
- Keys under the dial: +/− , ALT, then EXT.
- Right column: AT/NORM. key, LEVEL knob, TRIG. INP. BNC («100 Vp max.»).

## Lower right block (vertical) 387…752 × 202…376
- Outer columns: Y-POS. I / Y-POS. II knobs; «CH. I» / «CH. II»; two keys each (CH I: GD, AC/DC; CH II: AC/DC, GD) with the
  «▬ AC / GD ▪ DC» legends; «INPUT 1 MΩ ∥ 25 pF»; the input BNCs («max. ⏚ 400 Vp», «HOR. ⏚ INP.»).
- VOLTS/DIV. I and II: grey dial fields, scale V: 20 10 5 2 1 .5 .2 .1, mV: 50 20 10 5; skirt knobs with red VAR caps.
- Centre: two «⊳ CAL.» marks and two «▲ VAR. 2.5:1» marks.
- Bottom row: GD 4 mm jack, ×5 Y MAG. (red push button) for CH I, VERT. MODE box with CH I/II (TRIG. I/II), DUAL, ADD
  («└ CHOP. ┘» under DUAL + ADD), ×5 Y MAG. for CH II, INV. (CH. II) key.

## Controls → keys (behaviour kept; new real controls added)
PWR, INT, FOC, TR, XP, HO (hold-off, no effect on a periodic signal), XY, TVS (TV SEP., no video signal on this bench → no effect),
TCPL (AC/DC/HF/LF/~; ~ = line trigger, the generator is not locked to the mains → free-runs), TD + TV (VAR), SLP (+/−),
ALT (alternate trigger: in DUAL each trace triggers on its own channel), EXT (external trigger: TRIG. INP. is empty → no trigger),
ATN, LV, Y1/Y2, V1/V2 + VV1/VV2, AC1/GD1, AC2/GD2, YM1/YM2 (×5: 5 × more sensitive), CH12, DUAL, ADD, INV, XMAG, COMP.

## Assumptions
- The TIME/DIV range is read from the dial in the ref photo: 100 ms … 0.2 µs/div (18 steps).
- VOLTS/DIV: 12 steps 5 mV … 20 V/div (HM 203-7 data); the ref photo shows 5 V at the bottom-left, 10 V and 20 V sit under it.
