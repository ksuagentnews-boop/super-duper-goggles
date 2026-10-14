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
