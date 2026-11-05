---
name: CrooksCodes
description: A portfolio drawn as a locksmith's sheet whose figure is a lit model of one door with five locks on its seam. White sheet, ink lettering, real brass.
colors:
  paper: "#F7F7F5"
  ink: "#1A1C1F"
  brass: "#B98A3A"
  steel: "#5B6670"
  red: "#D23B2E"
  red-press: "#B8301F"
  white-field: "#FFFFFF"
  rule: "rgba(26, 28, 31, 0.22)"
  rule-faint: "rgba(26, 28, 31, 0.1)"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(56px, 6.6vw, 96px)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(30px, 2.9vw, 44px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  lead:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(18px, 1.45vw, 21px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  table:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
  nav:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.12em"
  action:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
  readout:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.12em"
  stamp:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.22em"
  micro:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  none: "0px"
spacing:
  hair: "1px"
  xs: "6px"
  sm: "12px"
  md: "18px"
  gutter: "24px"
  frame: "28px"
  lg: "44px"
  figure: "52px"
  nav: "64px"
  block: "84px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white-field}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "15px 22px"
  button-primary-hover:
    backgroundColor: "{colors.red-press}"
  link-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0"
  input:
    backgroundColor: "{colors.white-field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "11px 12px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    typography: "{typography.nav}"
    padding: "6px 0"
  nav-link-active:
    textColor: "{colors.ink}"
  sheet-tab:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "7px 10px"
  title-block-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
  figure-frame:
    backgroundColor: "{colors.white-field}"
    rounded: "{rounded.none}"
    padding: "{spacing.gutter}"
  readout:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.steel}"
    typography: "{typography.readout}"
    rounded: "{rounded.none}"
    padding: "7px 9px"
  stamp:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 18px"
  shutter-stamp:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "7px 10px"
---

# Design System: CrooksCodes

## Overview

**Creative North Star: "The Locksmith's Drawing Sheet"**

The whole site is one engineering sheet. A fixed border with zone marks (1 to 8 across, A to F down) frames every viewport; a sticky drawing header carries the brand and the sheet number; the sections are the parts of a drawing (notes, figures, parts list, revisions, title block) rather than the parts of a web page. The figure is a lit Three.js model of one door and its jamb with five locks along the seam: real brass and satin steel hardware with screw heads, a painted panel leaf, a timber jamb, soft shadows under a room environment, with the sheet's own ink balloons on leader lines laid over it. Each block of the sheet releases one lock, top to bottom, and the block body itself opens with its lock, a hatched shutter sliding away as the barrel bolt, deadbolt, chain, hasp and hook give way. At the title block the door swings open and the red action is right there.

The sheet is paper and ink; the figure is rendered material. Nearly everything on the sheet is a 1px or 1.5px ink line on an off-white page, with one signal red reserved for the contact action and the seam. The figure's colour (brass, steel, paint, timber) lives inside the figure and never leaks into the UI. Density is high and tabular: data is printed in tables with tabular numerals, labels are small condensed capitals, and rules rather than whitespace separate things. It refuses the dark hacker page, the glowing gradient, the rounded card, and the drop shadow.

**Key Characteristics:**
- One sheet: a fixed 1.5px ink border with zone marks frames the viewport at every size.
- Paper and ink: flat fills, 1px rules, no shadows, no radius; the only gradients are the hatches (shutter, preliminary figure).
- The figure is the only rendered thing: lit brass, steel, paint and timber belong to the model, and the sheet's own red marks the seam on it.
- One signal: red is the contact action and the seam, nothing else.
- Condensed capitals for everything that labels; Barlow text for everything that is read.
- Numbers are data: tabular numerals in tables, readouts and the lock schedule.
- Motion is one state, read from scroll: the locks, the camera and the block shutters all move from the same release values; UI state transitions stay at 120 to 150ms.

## Colors

A near-monochrome sheet with one signal, laid over a figure that carries its own rendered palette.

### Primary
- **Signal Red** (`{colors.red}`): the primary action (Send a message / Send message), the seam between door and jamb in the figure (a flat unlit stripe), and the seam's balloon callout (7). Nowhere else. Pressed state is **Red Press** (`{colors.red-press}`). On the share card the Contact cell is the same red.

### Neutral
- **Sheet** (`{colors.paper}`): page background, nav background, table cells, every cell inside an ink-gridded block, the readout, the sheet tabs, the shutter's base and its Locked stamp. Also the html background and theme-color.
- **Ink** (`{colors.ink}`): all text, all structural borders (sheet border, nav rule, block rules, shutter rules, table head rules, gridded cell seams), focus outlines, selection background, the balloon callouts' leaders, dots and strokes, and the hatch strokes in the no-WebGL drawing.
- **Housing Steel** (`{colors.steel}`): secondary text (labels, captions, zone marks, nav links at rest, footer, hints, the Group and Released-by columns, "In progress" markers) and the scrollbar thumb. It is a text colour, not a fill, and it is not the figure's steel.
- **White Field** (`{colors.white-field}`): the only surface lighter than the sheet. Used for the figure frames (so captured screenshots sit on a white mount), text inputs, and the form error box. Also the text colour on the red action.
- **Rule** (`{colors.rule}`): hairline dividers inside tables and the mobile menu, the outer offset line of the sheet border, image borders, the readout border, the share card's one tick.
- **Rule Faint** (`{colors.rule-faint}`) and **Brass** (`{colors.brass}`): declared on the sheet root but used by no rule in the shipped CSS. Brass in particular is not the figure's brass (below) and should not be read as a UI accent.

### The Figure's Materials (rendered, not UI tokens)
The model is matte clay built in Blender: `blender/build_door.py` writes `public/models/door.glb`. Nothing is metallic; brass and pewter read through colour alone, over one soft thumb-dent normal map. The page lights it with a room environment at 0.5, a warm key (`#ffebd2`, 3.0) and a cool rim (`#9fb4c8`, 1.1). These are not CSS tokens.
- **Slate** (`#46535F`): the door leaf. **Frame** (`#2E3740`): jamb, lintel, sill, hinge post.
- **Clay Brass** (`#C89B4F`, roughness 0.46): the working parts and hinges. **Pewter** (`#9AA3AB`): plates, keeps, staples, screws, padlock body.
- **Dark** (`#14181C`): slots and recesses. **Seam** (`#D23B2E`): sculpted in red clay.


### Named Rules
**The One Red Rule.** Red appears on the primary action and the seam (formerly also the seam's balloon). Any third use of red dilutes the only signal the sheet has.

**The Ink Draws, Steel Labels Rule.** Primary text and every structural line is Ink. Steel is for secondary and label text only; it never fills a surface and never draws a border.

**The Figure Keeps Its Colour Rule.** Brass, steel, paint and timber are materials in the model. No UI element is filled with them, and no CSS token is tuned to match them; the figure's warmth is the figure's.

**The Nothing Darker Than Paper Rule.** There are no dark surfaces on the sheet. Depth and emphasis come from line weight (1px rule, 1.5px border, 2px focus ring), never from a filled panel.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, sans-serif), weights 500 / 600 / 700, loaded through next/font as `--font-barlow-condensed`.
**Body Font:** Barlow (with Helvetica Neue, Arial, sans-serif), weights 400 / 500 / 600 / 700 plus italic, loaded as `--font-barlow`.

**Character:** The condensed face is the drawing hand: titles, tabs, table heads, callouts, readouts, stamps, zone marks, all set in capitals with wide tracking or tight in the display sizes. Barlow is the text set in the notes column: regular weight, generous 1.6 leading, never uppercase. The two are the same family at two widths, so the sheet reads as one hand.

### Hierarchy
- **Display** (700, `clamp(56px, 6.6vw, 96px)`, 0.92, -0.01em, uppercase): the drawing title, used once for the name. Under 900px it tightens to `clamp(48px, 13vw, 76px)`. Balanced wrap.
- **Headline** (600, `clamp(30px, 2.9vw, 44px)`, 1.05, -0.005em, sentence case): the block lead, one sentence per block, max width 18em, balanced wrap. It is a paragraph; the block's heading is its tab.
- **Title** (600, 26px, 1.1): figure titles (project names) in captions.
- **Lead** (400, `clamp(18px, 1.45vw, 21px)`, 1.5): the hero claim, max width 32em.
- **Body** (400, 17px, 1.6; 16px under 900px): notes and figure bodies, measured at 60 to 62ch. Figure summaries are the same size at weight 500.
- **Table** (400, 15px, 1.45; 14px under 900px): all table cells, tabular numerals. First-column item numbers switch to condensed 600 at 14px with 0.06em tracking; secondary columns (Group, Released by, Date, By) are condensed 500 with 0.04 to 0.06em.
- **Label** (600, 11px, 1, 0.14em, uppercase, Steel): definition keys, table heads, captions, form labels, title-block keys, callout labels (Ink, 0.1em), sheet tabs (Ink, 0.16em).
- **Nav** (600, 13px, 1, 0.12em, uppercase): nav links, numbered note markers, figure numbers, figure links, the skip link.
- **Action** (600, 14px, 1, 0.14em / 0.10em, uppercase): the red action and the quiet link; 13px under 520px.
- **Readout** (500, 12px, 1, 0.12em, tabular, uppercase): the scene readout (11px on the phone band), brand sheet number, stack lines, footer.
- **Stamp** (700, 12px, 1, 0.22em, uppercase): the Locked stamp on a shutter. The Preliminary stamp is the same voice at 15px / 1.25 / 0.2em.
- **Micro** (500, 10px, 1, 0.1em to 0.14em): zone marks and view labels. The hero hint is condensed 500 13px / 1.4 at 0.06em in Steel, sentence case.

### Named Rules
**The Condensed Labels Rule.** Anything that labels, numbers, heads or stamps something is Barlow Condensed in capitals with tracking of at least 0.1em. Anything meant to be read as prose is Barlow, regular, sentence case, never tracked.

**The Tabular Numbers Rule.** Every number inside a table, readout, counter or schedule uses `font-variant-numeric: tabular-nums`.

## Layout

The sheet is a fixed frame: a 28px margin (`{spacing.frame}`) all round holds the zone marks, and the drawing area inside it is bordered with a 1.5px Ink line plus a 1px Rule line offset 5px outside it. Content sits inside the frame with a further 24px gutter (`{spacing.gutter}`), so the left edge of text is 52px from the viewport edge at desktop.

One block per row on alternating sides, each 46% wide (50% under 1100px), on a solid paper panel with a 1px Ink edge. The figure is a transparent full-bleed canvas behind the sheet with no frame of its own; the door moves to the side the text is not on and slides behind the panels between blocks. It only renders while something is moving. On load it swings in from the right as its locks throw shut top to bottom, in 1.7 seconds, while the hero text wipes on. The sticky nav spans the whole sheet width at the top of the frame, 64px tall (`{spacing.nav}`), ruled beneath with 1px Ink. Smooth scroll with `scroll-padding-top` equal to frame + nav + gutter.

Vertical rhythm comes from rules, not air. Each section is a block with a 1px Ink top rule and 84px padding above (`{spacing.block}`; 64px under 900px) and 32px below. A sheet tab hangs from the block's top rule at the left; a continued block (Revisions, continued) drops the top rule, pads 24px, and sets its tab static with a closed top edge. The block lead carries 30px below; the block body sits in a gate that the scene opens. Notes stack at 18px (`{spacing.md}`), figures at 52px (`{spacing.figure}`), tables at 28px below. Gridded blocks (the Drawn by / Location block, the title block) are ink grids built with a 1px gap over an Ink background inside a 1.5px Ink border, cells padded 12px 14px or 14px 16px.

Under 900px the sheet collapses to one column: the frame shrinks to 14px, the left and right zone strips disappear (top and bottom remain), the nav drops to 56px with a bordered Menu toggle and a dropdown list, and the figure stage becomes a fixed band 38svh tall under the nav on paper, with a soft fade at its lower edge and the content scrolling under it. The band crops to the working lock and the hero shows the whole door; the readout sits at its bottom right. Under 520px the key-value block, form and figure views go to one column and the revision table drops its By column.

## Elevation & Depth

Flat on the sheet, lit in the figure. The sheet uses no drop shadows and no tonal layering; depth is a matter of line: a 1px Rule for a division, a 1px Ink line for a boundary, a 1.5px Ink line for a frame, and a double line (an Ink or Red border with a 2px paper inset and a 1px inner line, drawn with inset box-shadows) for the three stamped elements: the red action, the Preliminary stamp, and the Locked stamp on a shutter. Focus is a 2px Ink outline offset 3px, or on fields a 2px Ink ring drawn with box-shadow. Hover on a quiet link thickens the underline from 1px to 2px; hover on a figure draws a 1.5px Ink outline around its views.

The figure is the one lit object: PCF soft shadows from the key light onto the painted leaf and jamb, a room environment reflected in the metals. That light stays inside the canvas; nothing on the sheet casts a shadow to match it. The one soft shadow in the CSS is the mobile nav dropdown, `0 18px 30px -18px rgba(26, 28, 31, 0.5)`, so the menu reads as lying over the figure band; it belongs to that overlay only.

### Named Rules
**The Line Weight Rule.** Emphasis on the sheet is a heavier line, never a shadow or a fill: 1px Rule, 1px Ink, 1.5px Ink, 2px Ink (focus and active underline), double-line for a stamp.

**The Light Stays in the Figure Rule.** Shadows, highlights and reflections are the model's. The sheet around it is unlit paper.

## Shapes

Square everything on the sheet. Border radius is 0 on every element including inputs, buttons, images, cells and stamps. Borders are solid Ink; the preliminary figure frame is the only dashed border and the only transparent frame. The recurring silhouettes are the drawing's own: a rectangle with a double-line border (stamp, action, Locked), a tab hanging from a rule, a gridded cell block, a hatched shutter between two rules, a circle only as an SVG balloon callout (Ink stroke 1.2px, r 11, 12px numeral) at the end of a 1px leader line with a filled Ink dot (r 2.2) at the part. Icons are 14px line glyphs, 1.6px stroke, square caps, miter joins, drawn inline as SVG paths. The one rotation on the sheet is the Preliminary stamp at -6 degrees.

The figure's hardware is modelled with bevelled edges, turned profiles and swept wire because that is what cast and turned hardware looks like. Every moving part is its own node with its origin on its pivot, so the page's scroll code drives the Blender model directly. That softness is the model's material, not a licence for radius in the CSS.

## Components

### Buttons
Stamped and square; the only place red fills a surface.
- **Shape:** square (0px), double-line border: 1.5px Red border with an inset 2px paper line and a 1px red line inside it.
- **Primary (`.action`):** Signal Red fill, White Field text, condensed 600 14px uppercase 0.14em, padding 15px 22px, 10px gap to an inline 14px icon.
- **Hover / Active / Disabled:** fill to Red Press on hover (150ms); translateY(1px) on press (120ms); 0.55 opacity with a progress cursor while submitting.
- **Quiet link (`.link-quiet`):** no fill, Ink text, condensed 600 14px uppercase 0.10em, underlined 1px at 5px offset, thickens to 2px on hover. Used for the secondary hero action and Send another. The same underline treatment at 13px is the figure link (Open site), and in Steel with no underline it is the "In progress" marker.

### Cards / Containers
There are no cards. Containers are frames, grids and gates.
- **Block gate (`.block-gate`):** every block body sits in a gate. A shutter overlays it: paper with a 45 degree hatch of 18% Ink at 9px pitch, 1px Ink rules top and bottom, scaled from the bottom by `1 - --open`, carrying a Locked stamp (condensed 700 12px 0.22em, double-line Ink border, 7px 10px) 18px from the top. The body beneath fades from 12% to full and rises 14px as `--open` goes 0 to 1. `--open` defaults to 1 on the block and is set by the scene from the lock's release (`release / 0.85`; the door's `/ 0.5` for the title block), so the block is readable before the lock is fully home. Under reduced motion the shutter is removed and the body is fully open. No transition is declared; the scene writes the value each frame.
- **Figure frame (`.fig-frame`):** 1px Ink border on a White Field mount, 24px padding, a two-view grid (desktop 1fr and phone 26%; 28% under 900px, stacked with the phone view at 46% under 520px) with 1px Rule borders on the images and a 10px Steel view label beneath each. The whole frame is one link; hover draws a 1.5px Ink outline on the images. A preliminary figure uses a dashed 1px Ink frame, transparent fill, a 45 degree hatch of 7% Ink at 10px pitch, and the rotated Preliminary stamp (condensed 700 15px, 0.2em, double-line Ink border).
- **Figure caption (`.fig-cap`):** a two-column grid, 4.5em for the figure number (condensed 600 13px uppercase, spanning the rows) and the rest for title, summary, body (60ch), and a meta row with the Steel stack line left and the figure link right.
- **Ink grid (`.kv`, `.titleblock`):** 1.5px Ink border, 1px Ink seams, paper cells, two columns (one under 900px / 520px), each cell a Steel label over 16px Ink value. The title block adds wide cells and a form cell padded 24px 16px.
- **Tables (`.tbl`):** collapsed, fixed layout, 15px text, 1px Ink rules above and below the head, 1px Rule under each row, head and caption in Label style, cells padded 11px with a 24px right gutter, first column 3.6em in condensed 600. Variants: schedule (Lock column 600, 9em Steel condensed Released-by column), parts (9em Steel condensed Group column), revisions (8.5em condensed Date column, 2.4em By column, bold role and org).

### Inputs / Fields
- **Style:** White Field, 1px Ink border, 0px radius, padding 11px 12px, Barlow 400 16px, Ink caret; textarea resizes vertically. Label above in Label style, with a tabular character count right-aligned where there is a limit.
- **Focus:** outline removed, 2px Ink ring via `box-shadow: 0 0 0 2px`.
- **Error / Disabled:** error is a 1px Ink box on White Field, 500 weight, prefixed "Error: " in 600; disabled is 0.55 opacity.

### Navigation
- **Desktop:** sticky at the frame top, 64px, 1px Ink rule beneath, paper background. Brand is condensed 700 18px uppercase 0.04em over a Steel 11px sheet number (DWG CC-2026 · SHEET 1 OF 1). Links (Notes, Figures, Parts, Revisions, Contact) are Nav style in Steel, 28px apart, 6px vertical padding, 2px transparent bottom border; hover to Ink; the current section (set by an IntersectionObserver) is Ink with a 2px Ink bottom border.
- **Mobile (under 900px):** 56px; a bordered Menu / Close toggle (1px Ink, condensed 600 12px, 8px 12px) opens a full-width dropdown list on paper with a 1px Ink bottom rule and 1px Rule row separators; links at 14px vertical padding; current link gets a 2px Ink left border and 12px indent. Closes on Escape, outside pointer, or link click.
- **Skip link:** Ink on paper inverted (Ink fill, paper text), fixed, appears at 12px on focus.

### Sheet Frame (signature)
A fixed, pointer-transparent overlay: paper strips 28px deep on all four sides, 1.5px Ink border inset 28px with a 1px Rule offset 5px outside it, and zone marks (numbers 1 to 8 across top and bottom, letters A to F down the sides) in Micro Steel condensed, separated by 1px Rule ticks. Under 900px the side strips are dropped and the frame is 14px.

### Sheet Tab (signature)
The section heading of a drawing block, set as the block's h2: condensed 600 11px uppercase 0.16em in Ink, padded 7px 10px, 1px Ink border on three sides with the top open, hung at top -1px from the block's top rule, paper fill. Tab text names the drawing part (Notes, Figures, Parts list, Revisions, Title block). The quiet variant (`.block-tab--quiet`) for a continued block sits in flow with a closed 1px top edge and 18px below. It is a drawing-sheet device tied to the block rule and is not a licence for free-standing eyebrow labels above headings.

### Balloon Callout (signature)
The figure carries no balloons or leader lines: each block labels its own lock in its heading line, so the door stays part of the page instead of reading as a diagram.

### Readout (signature)
A small bordered paper tag at the stage's bottom right: condensed 500 12px uppercase 0.12em Steel, tabular numerals, 1px Rule border, 7px 9px padding, reporting `LOCKS n/5 · DOOR CLOSED` and then `DOOR OPEN nn°` as the leaf swings to 58 degrees. 11px on the phone band.

### The Figure (signature)
A Three.js elevation of one door and its jamb built from `lockSpec.ts` (the same numbers print in the lock schedule and parts list): five locks on the seam at y = 16, 8, 0, -8, -16 (barrel bolt, deadbolt, door chain, hasp and padlock, hook latch), a door leaf 58 degrees open at the end. Rendered, not drawn: the materials above, PCF soft shadows, a `RoomEnvironment`, ACES tone mapping, transparent clear colour over the paper, device pixel ratio capped at 1.5, low-power preference. An orthographic camera travels the column: wide on the whole door at the hero (zoom 1; 0.7 on phones), close on each lock as its block arrives (1.75; 1.35 on phones) with a slight pull-back between locks, wide again and stepped to the hinge side as the door opens, the rig turning to a three-quarter view. Scroll is the only input: each block's progress past 62% of the viewport sets its lock's release (home by 40% of the block) and the camera moves on over the block's last third; values are smoothed with exponential easing and the bolts overshoot like hardware clacking home. The rig also sways idly (0.08 rad on a 0.3 Hz sine) and the dropped chain swings; under reduced motion the sway stops, every lock is released, the door stands open. Without WebGL a flat SVG elevation in the same five colours with Ink edges and a hatched jamb takes its place.

## Do's and Don'ts

### Do:
- **Do** keep the sheet frame and zone marks on every viewport; the frame is the identity, not decoration.
- **Do** draw boundaries with lines: 1px Rule to divide, 1px Ink to bound, 1.5px Ink to frame, 2px Ink for focus and current state.
- **Do** set every label, head, tab, callout, stamp and number in Barlow Condensed capitals with at least 0.1em tracking, and every paragraph in Barlow regular at 17px / 1.6.
- **Do** use tabular numerals wherever numbers align (tables, readouts, counters, the schedule).
- **Do** put new data in a table or an ink grid with Steel label keys and Ink values, following the title-block cell pattern.
- **Do** mount screenshots on White Field inside a 1px Ink figure frame with View A / View B labels and a numbered figure caption.
- **Do** mark unfinished work with the dashed frame, the 7% hatch, and the rotated Preliminary stamp rather than a placeholder image.
- **Do** gate a new block the same way: a hatched shutter between two Ink rules with a Locked stamp, driven by a `--open` the scene publishes, open by default and removed under reduced motion.
- **Do** keep red to the primary action and the seam, and keep the figure's brass, steel, paint and timber inside the figure.
- **Do** let each block name its lock in text, in Ink, and keep red to the action and the seam.

### Don't:
- **Don't** use a border radius anywhere in the CSS; every corner on the sheet is square. The model's rounded hardware is not a precedent.
- **Don't** add drop shadows, gradients, blurs or glass to the sheet; the figure's lighting stays in the canvas, the hatches are the only gradients, and the mobile nav dropdown's soft shadow is the only exception and stays there.
- **Don't** introduce a dark panel, a filled card or a tinted background; the only surfaces are Sheet and White Field.
- **Don't** fill a surface with Steel or draw a border with it; Steel is for secondary text.
- **Don't** add a third accent, use red for a link or a tag, or use `--brass` (or the figure's brass) as a UI colour.
- **Don't** track or uppercase Barlow body text, or set prose in Barlow Condensed.
- **Don't** add free-standing kicker or eyebrow labels above headings; the only label above a block lead is the sheet tab hanging from the block's top rule, and that tab is the block's heading.
- **Don't** animate the page on a timer; the figure, the camera and the shutters all move from scroll-derived state, and UI transitions stay at 120 to 150ms on colour, border, underline and box-shadow only, disabled under reduced motion.
- **Don't** use icon fonts or glyph icons; icons are inline 14px SVG line paths with square caps.
