# Digilent breadboard (EE312 Exp 5): notes (batch 5, item 10)

Sources: lab slides 14 (the board), 21 (power rails), 22–23 and 29 (parts, jumpers), 15 (BNC → mini-grabber leads),
26, 31–32 (hooks on jumper ends). Drawing: `engine/breadboard.js`; comparison: `breadboard-compare.png`.

| Element | Slides | Simulator |
|---|---|---|
| Base | green, «DIGILENT · A National Instruments Company» down the left edge | same |
| Binding posts | left column, from the top: ⏚ black, Vc red, Vb yellow, Va blue | same; banana plugs go on top, jumpers to the 4 points round each post |
| Vertical rails | two long rails next to the posts, each connected along its length (red / blue lines) | same (left = the +15 V rail, right = the −15 V rail in the steps) |
| Terminal blocks | blocks of 5-hole columns (rows J…F above the channel, E…A below), rail pairs (− blue, + red) above, between and below | 2 blocks × 30 columns (the real board has 4 blocks × 64): enough for both circuits; hole pitch larger than real so a finger can reach every hole |
| µA741 | DIP-8 across the channel, notch left | same: pins 8…5 in row F, 1…4 in row E |
| Resistors, diodes | small bodies on long thin bent legs, hole to hole | same (body at its real size against the holes, legs bent into the holes) |
| Jumpers | thin coloured kit wires, hole to hole | same, kit colours (repaintable with «لون السلك») |
| Scope / generator leads | BNC → mini-grabber hooks clipped onto the bare end of a jumper standing in the board | same: «Jumper for a hook» from «العلبة» stands in a hole; a coax clip only hooks onto such an end |
| Supply leads | banana leads into the binding posts | same; the MT3805 leads check each rail on the posts (slides 19–20) |

## Batch 7 (owner, 15 Oct)
- Three breadboards stacked, each with its pair of horizontal rails (− blue, + red) at its edges (four pairs in all); the two long vertical rails on the left carry ground only.
- Posts as on the lab board: ⏚ black, Vc red, Vb teal-blue, Va yellow (slide 14 is a stock photo with Vb / Va swapped).
- Supply leads (slide 21): left − green → Va (−15 V); left + orange → ⏚; blue from left + (stacked on the orange plug) to right −; right + dark red → Vb (+15 V). Vc unused.
- Reference wiring («وصّل لي»): ⏚ → black jumpers to both vertical rails; Vb → red jumper to the bottom breadboard's + rail, Va → yellow jumper to its − rail; red / yellow jumpers up to the + rail above and the − rail below the middle breadboard where the µA741 sits (pin 7 / pin 4); a black jumper from the vertical rail to the + row below the middle breadboard, used as the ground row. Screenshot: `breadboard-3boards.png`.
