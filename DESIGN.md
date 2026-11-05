---
name: CrooksCodes
description: A pale drawing sheet whose figure is a matte clay door with five locks on its seam. One lock gives per section, and at Contact the door opens on a warm lit room.
colors:
  red: "#D23B2E"
  red-press: "#B8301F"
  paper: "#F7F7F5"
  ink: "#1A1C1F"
  steel: "#5B6670"
  white-field: "#FFFFFF"
  rule: "rgba(26, 28, 31, 0.22)"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(56px, 6.6vw, 96px)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(38px, 3.6vw, 54px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "30px"
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
  inset: "16px"
  field: "18px"
  gutter: "24px"
  frame: "28px"
  block-end: "40px"
  group: "44px"
  block: "56px"
  nav: "64px"
  frame-stacked: "14px"
  gutter-stacked: "18px"
  nav-stacked: "60px"
  stage-stacked: "26svh"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white-field}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "15px 22px"
  button-primary-hover:
    backgroundColor: "{colors.red-press}"
    textColor: "{colors.white-field}"
  link-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0"
    height: "44px"
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
  lock-tag:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
  lid-stamp:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "7px 10px"
  contact-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
  capture-frame:
    backgroundColor: "{colors.white-field}"
    rounded: "{rounded.none}"
    padding: "{spacing.inset}"
  readout:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.steel}"
    typography: "{typography.readout}"
    rounded: "{rounded.none}"
    padding: "7px 9px"
---

# Design System: CrooksCodes

## Overview

**Creative North Star: "The Clay Door on the Drawing Sheet"**

The page is a pale drawing sheet and its figure is one hand-pressed door: matte clay, a slate leaf in a darker frame, brass and pewter hardware that read by colour alone, and five locks down a red seam. Scrolling releases one lock per section. At Contact the door swings 80 degrees and a warm lit room shows behind it, beside the form. The door is the one rendered thing; everything around it is flat paper and ink.

The sheet is texture, not vocabulary. A fixed border and zone marks give the page its character, but every heading and label uses plain words: About, Projects, Skills, Experience, Education, Contact. A recruiter never has to decode a metaphor to find the work. The security reading of the door appears in exactly one place, the lock schedule in About.

Density is tabular and direct: rules rather than whitespace divide things, data sits in tables with tabular numerals, labels are small condensed capitals. The world refuses the dark hacker page. Reading always comes first: the door works around the text, and nothing dims or waits on it.

**Key Characteristics:**
- One sheet: a fixed ink border and zone marks frame every viewport, as texture only.
- Plain words: section names and labels say what they are; the lock metaphor stays in the figure and one schedule.
- Clay, not metal: one matte material throughout the model, with brass and pewter by colour alone.
- Line weight on the page, light in the figure: lit clay, a warm room and a soft shadow live in the canvas; the UI stays flat.
- One lock per section, driven by scroll, with the content readable before the lock gives.
- Red is rare: the contact action and the seam, with its darker press tone for hover and validation.

## Colors

A near-monochrome sheet with one signal, beside a figure that keeps its own clay palette.

### Primary
- **Signal Red** (`{colors.red}`): the fill of the contact actions (Send a message, Send message) and the seam on the door. Text on it is always White Field (4.77:1). Ink on it would be 3.58:1 and is never used.
- **Red Press** (`{colors.red-press}`): the action's hover fill, plus the border, ring and message of an invalid field (5.62:1 as text on Sheet).

### Neutral
- **Sheet** (`{colors.paper}`): page, nav, opaque text panels, cells in the contact grid, the lid's base and stamp, the readout, the page background and theme colour.
- **Ink** (`{colors.ink}`): primary text (15.92:1) and all structural lines: sheet border, nav rule, panel edges, table head rules, grid seams, focus outlines, selection fill, skip link fill.
- **Housing Steel** (`{colors.steel}`): secondary text at 5.47:1 on Sheet: labels, zone marks, resting nav links, stack lines, captions, the lock tag, the readout, the footer, "In progress". Also the scrollbar thumb. It is not the door's hardware colour.
- **White Field** (`{colors.white-field}`): the one surface lighter than Sheet, for form fields, the form error box and the mount behind project captures. Also the text colour on red.
- **Rule** (`{colors.rule}`): hairlines inside tables and the mobile menu, the sheet border's outer line, zone ticks, capture image borders, the lock tag and readout borders.

### The Figure's Palette (rendered, not UI tokens)
These live in `blender/build_door.py` and `public/models/door.glb`. Every material has metalness 0, over one shared normal map of thumb dents and fine grain.
- **Slate** (`#525A60`, roughness 0.74): the door leaf.
- **Frame** (`#3A3D40`, roughness 0.78): jamb, lintel, sill and hinge post.
- **Clay Brass** (`#C89B4F`, roughness 0.46): working parts and hinges.
- **Clay Pewter** (`#9AA3AB`, roughness 0.6): plates, keeps, staples, screws, the padlock body.
- **Recess Dark** (`#14181C`, roughness 0.6): slots and recesses.
- **Seam Red**: Signal Red, sculpted in clay along the door's edge.

The lit room is painted in Three.js, not modelled: a radial gradient (`#ffe2b4`, `#f3ab62`, `#a9591f`, `#5c2c10`) that stays near black (`#0d0f12`) until the door opens, with a floor pool of `rgb(240, 165, 90)` at up to 72% alpha and a point light of `#ffb36b`. Lighting is an environment at 0.5, a warm key (`#ffebd2`, 3.0), a cool rim (`#9fb4c8`, 1.1, falling to 0.35 as the door opens) and a low ambient (`#b8c2cc`, 0.18), under ACES tone mapping at exposure 1.05.

### Named Rules
**The One Red Rule.** Signal Red fills the contact action and marks the seam, nothing else. Red Press extends it only to hover and invalid fields. A third use dilutes the only signal the sheet has.

**The White On Red Rule.** Text on red is white, only. Signal Red is also never set as small text on Sheet, where it reaches only 4.44:1; use Red Press for error text.

**The No Metal Rule.** The model has no metalness anywhere. Brass and pewter are clay colours and read through colour alone; a metallic material breaks the hand-pressed object.

**The Figure Keeps Its Colour Rule.** Slate, frame, brass, pewter and the room's amber stay inside the canvas. No UI element is filled with them.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, sans-serif), weights 500, 600 and 700, loaded through next/font.
**Body Font:** Barlow (with Helvetica Neue, Arial, sans-serif), weights 400, 500, 600 and 700 plus italic, loaded through next/font.

**Character:** One family at two widths, so the sheet reads as one hand. The condensed cut does the titling and labelling in capitals; regular Barlow carries everything meant to be read as a sentence.

### Hierarchy
- **Display** (700, `clamp(56px, 6.6vw, 96px)`, 0.92, uppercase, balanced): the name, once. Stacked layout: `clamp(48px, 13vw, 76px)`.
- **Headline** (700, `clamp(38px, 3.6vw, 54px)`, 1, uppercase): the plain section names, set as the section's h2.
- **Title** (600, 30px, 1.1, sentence case): project names.
- **Lead** (400, `clamp(18px, 1.45vw, 21px)`): the hero claim at 1.5 leading and 32em; the one-sentence section lead at 1.4 leading, 34em, balanced.
- **Body** (400, 17px, 1.6; 16px stacked): About notes at 62ch and project text at 66ch. Project summaries are the same size at 500.
- **Table** (400, 15px, 1.45, tabular numerals): schedule and date tables. The skills table runs at 17px. Lock numbers and dates switch to condensed 500 or 600 with 0.04em to 0.06em tracking.
- **Label** (600, 11px, 1, 0.14em, uppercase): grid keys, table heads, form labels, and the lock tag.
- **Nav** (600, 13px, 1, 0.12em, uppercase): nav links and, at 0.1em, project links, skills row heads and the skip link.
- **Action** (600, 14px, 1, uppercase): the red action at 0.14em and the quiet link at 0.1em; 13px at 520px and below.
- **Readout** (500, 12px, 1, 0.12em, tabular): the scene readout, 11px stacked. The footer uses the same voice at 1.4 leading and 0.1em in capitals.
- **Stamp** (700, 12px, 1, 0.22em, uppercase): the Locked stamp on a lid.
- **Micro** (500, 10px, 1, 0.1em): zone marks.

The brand in the nav is condensed 700 at 18px with 0.04em tracking, over the city at 500, 11px, 0.12em. Stack lines are condensed 500 at 13px, 1.4, 0.08em, uppercase.

### Named Rules
**The Two Widths Rule.** If it labels, heads or numbers something, it is Barlow Condensed. If it is a sentence, it is Barlow in sentence case, never tracked and never uppercase.

**The Tabular Numbers Rule.** Numbers that align or count (tables, the lock tag, the readout, the character counter) use tabular numerals.

## Layout

The sheet frame sits at a 28px margin (`{spacing.frame}`), with content a further 24px in (`{spacing.gutter}`). The nav is sticky at the frame's top edge, 64px tall (`{spacing.nav}`), running the sheet's full width so the door never shows beside it.

On the wide layout one block sits per row on alternating sides: About left, Projects right, Skills left, Experience right, Education left, Contact right. Blocks are opaque paper panels 46% wide (62% for Projects; 50% and 66% at 1100px and below), at least 86svh tall, with a 1px Ink edge on the side facing the door. The canvas is full-bleed and fixed behind them, and the door travels to the free side, passing behind the paper between blocks. The hero is 46% wide with the whole door owning the right half of the first viewport.

Vertical rhythm comes from rules: each block has a 1px Ink top rule, 56px above and 40px below. Leads carry 30px below, notes stack at 16px, project figures at 56px, table groups at 28px, form rows at 18px.

**Projects** read words first and then evidence: title and link on one line, summary, body, stack, and only then the framed captures. Desktop and phone captures sit side by side on a White Field mount, 24% for the phone (30% on the stacked layout). At 520px and below the desktop capture is removed and the phone capture alone is centred at 62%. A project with nothing live shows its words and a Steel "In progress" marker with no frame or placeholder.

**The stacked layout** applies at max-width 900px or any portrait aspect ratio, which is the same query the scene uses to pick its shots. The frame drops to 14px, the gutter to 18px, the nav to 60px, body text to 16px; side zone marks and the border's outer line go. The door rides in a fixed stage 26svh tall under the nav, on paper above the text, with a 20px fade at its lower edge where text passes beneath. Anchors and keyboard focus scroll to frame + nav + stage + 8px so nothing lands under the door. While focus is inside the contact form the stage is hidden, because the keyboard needs the room; the space stays reserved so the form does not jump. If the figure fails, the reserved space and scroll offset are given back.

**At 520px and below** the contact grid and form go to one column, schedule columns narrow, and action text steps to 13px.

### Named Rules
**The Reading First Rule.** Text is never behind the door, under a dim, or waiting on Three.js. The page is fully readable before the scene loads, and without it.

**The Plain Words Rule.** The sheet border and zone marks are decorative and `aria-hidden`; they carry no meaning. No section, label or link borrows drawing vocabulary.

## Elevation & Depth

Flat on the sheet, lit in the figure. UI depth is line weight: 1px Rule to divide, 1px Ink to bound, 1.5px Ink to frame, 2px Ink for focus and current state, and a double line for the stamped elements. Only the canvas holds real light: soft key-light shadows across the clay, the room's glow, the floor pool, and a soft painted shadow behind the door that seats it on the paper at every scroll position.

### Shadow Vocabulary
- **Double line, red** (`box-shadow: inset 0 0 0 2px paper, inset 0 0 0 3px red`): the action's inner line. A drawn line, not a shadow.
- **Double line, ink** (`box-shadow: inset 0 0 0 2px paper, inset 0 0 0 3px ink`): the Locked stamp's inner line.
- **Field ring** (`box-shadow: 0 0 0 2px ink`): field focus; Red Press at 1px at rest and 2px on focus when invalid.
- **Menu overlay** (`box-shadow: 0 18px 30px -18px rgba(26, 28, 31, 0.5)`): the stacked dropdown menu only, because it lies over the door.

### Named Rules
**The Light Stays in the Figure Rule.** Glow, cast shadow and warm light belong to the canvas, painted or rendered there. The sheet around it never casts a shadow to match; the menu overlay is the one soft CSS shadow.

**The Line Weight Rule.** Emphasis on the sheet is a heavier line, never a filled dark panel. The only dark fills are the skip link and text selection.

## Shapes

Square everything in the UI: 0px radius on buttons, fields, images, cells and stamps. The recurring silhouettes are the double-lined rectangle, the ink-seamed grid, the hatched lid and the ruled table. Icons are inline 14px SVG line paths with a 1.6px stroke, square caps and miter joins.

The model is the opposite on purpose: pillowed bevels and thumb dents, because that is what pressed clay looks like. Its softness is the door's material and sets no precedent for CSS radius.

## Components

### Buttons
Stamped and square; the only place red fills a surface.
- **Shape:** square (0px), 1.5px red border with an inset paper line and a 1px red line inside it.
- **Primary:** Signal Red, white condensed capitals, 15px 22px padding, 10px gap to an optional icon. Used for Send a message and Send message, and nothing else.
- **Hover / Focus:** fill to Red Press in 150ms; down 1px on press in 120ms; 2px Ink outline offset 3px on keyboard focus. Disabled is 0.55 opacity with a progress cursor.
- **Quiet link:** no fill, Ink capitals, a 1px underline at 5px offset that thickens to 2px on hover, minimum 44px tall. Project links use the same treatment at 13px.

### Cards / Containers
There are no cards. Containers are panels, grids and frames.
- **Contact grid:** 1.5px Ink border with 1px Ink seams on paper cells (12px 14px), two columns, a Steel label over a 16px value. In the hero: Email, GitHub, LinkedIn, Looking for.
- **Capture frame:** 1px Ink border on a White Field mount, 16px padding (10px stacked), each capture with a 1px Rule border. Hover draws a 1.5px Ink outline around the captures.
- **Tables:** collapsed and fixed, 1px Ink rules above and below the head, 1px Rule under rows, 11px cell padding with a gutter on the right. The skills table is row-headed and has no head row.

### Inputs / Fields
- **Style:** White Field, 1px Ink border, 0px radius, 11px 12px padding, Barlow 400 16px, Ink caret, label above in Label style with a tabular counter on the message.
- **Focus:** outline replaced by a 2px Ink ring, in 150ms.
- **Error / Disabled:** invalid fields take a Red Press border and ring with a 15px weight 500 message beneath, and a failed submit moves focus to the first of them. A form-level error is a 1px Ink box on White Field. Disabled is 0.55 opacity.

### Navigation
- **Wide:** sticky, paper, 1px Ink rule beneath. Brand at left, six plain section links in Steel at 28px spacing, Ink on hover. The current section is Ink with a 2px Ink underline.
- **Stacked:** a bordered Menu / Close toggle at least 44px tall opens a full-width paper list with Rule separators and 16px link padding; it closes on Escape, an outside press or a link. The current link is underlined.
- **Skip link:** Ink fill, paper text, off-screen until focused, and it goes to Projects.

### Sheet Frame (signature)
A fixed, pointer-transparent overlay: paper strips at the margins, a 1.5px Ink border with a 1px Rule line 5px outside it, numbers 1 to 8 across and letters A to F down in Micro Steel with Rule ticks. Purely texture. Stacked keeps the top and bottom strips only.

### Section Head and Lock Tag (signature)
The heading row holds the plain section name at Headline with a small tag on the right of the same baseline: Steel Label capitals in a 1px Rule box, reading "Lock 1 of 5" through "Lock 5 of 5", and "The door" at Contact. One plain lead sentence follows. The tag names position only: it never names a lock's hardware or security layer.

### Hatched Lid (signature)
A lid over the top of each section's body, never over its heading or lead. Paper with a 45 degree hatch of 18% Ink at a 10px period, a 1px Ink top rule and a double-lined Locked stamp 18px down, up to 60svh tall. It clips away as the section arrives, starting when the section's top is 98% down the viewport and clear by 68%, ahead of the lock itself and before anyone reaches that text. It covers and clears; the content under it never changes opacity. Lids are open by default, closing only once the scene is running, so a failed load never leaves content covered. Under reduced motion lids do not exist.

### Lock Schedule (signature)
The table in About and the only place the metaphor is spelled out: Lock, Hardware, Stands for. Barrel bolt for perimeter, deadbolt for authentication, door chain for least privilege, hasp and padlock for encryption, hook latch for monitoring.

### Readout (signature)
A small paper tag at the stage's lower right: 1px Rule border, Steel, tabular, reporting `LOCKS n/5 · DOOR CLOSED` then `DOOR OPEN nn°`. Hidden until the model is ready and removed under reduced motion.

### The Door (signature)
A Blender model built by script, exported as a compressed GLB and loaded after the page is readable. Each moving part is its own node with its origin on its pivot, and five locks sit on the seam from top to bottom.

- **Camera:** a perspective camera at 26 degrees. The hero shows the whole door. Each section frames its lock from a slight angle turned toward the text, pulling back about 22% mid-move, with Projects held wider because its column is wider. At Contact the camera pulls back so the swung leaf sits on the hinge side and the lit opening is clear. The stacked layout uses its own closer, centred shots.
- **Scroll:** each lock runs as its section's top climbs from 72% to 30% of the viewport, the door arriving just before. The door opens over the same span at Contact, reaching 80 degrees, as the room lights and the floor pool fades in.
- **Hardware motion:** bolts overshoot slightly like a clack home; the chain slides then drops; the padlock falls away and the hasp swings; the hook swings off its eye.
- **Load-in:** once, over 1.7 seconds, the door swings in from the right as its locks throw shut top to bottom, while hero text wipes on from the left in 0.7 seconds (wide layout only for the swing). Past the hero on arrival, the entrance is skipped.
- **Performance:** frames draw only while something moves. Pixel ratio is capped at 1.5, and a slow device steps down to 1, then drops shadows.
- **Reduced motion:** the same story in stills. No entrance, no wipe, no lids, no travel; each lock, shot and door state cuts directly to the next as scroll crosses it.
- **Failure:** without WebGL or the model, the scene removes itself and the page reads complete.

## Do's and Don'ts

These two come from the owner and hold until he changes them.

**The No CV Yet Rule.** There is no CV or resume link, button or grid cell anywhere on the site. Do not add one or a placeholder for one until Jeremy supplies the document and asks for it.

**The Nothing Invented Rule.** No invented security projects, certifications, write-ups, metrics or testimonials. The page says plainly that there is no security work to show yet, and it shows shipped software instead.

### Do:
- **Do** keep the door matte: metalness 0 on every material, slate leaf, darker frame, brass and pewter by colour alone.
- **Do** name sections and labels in plain words, and keep the sheet border and zone marks as `aria-hidden` texture.
- **Do** give each new scroll stage the same contract: one lock per section, tagged "Lock n of 5", with the lock-to-layer mapping only in the About schedule.
- **Do** clear a lid by 68% down the viewport and leave the content beneath it at full opacity throughout.
- **Do** present a project as words first, then desktop and phone captures on a White Field mount, and show the phone capture alone at 520px and below.
- **Do** use the stacked layout at max-width 900px or portrait aspect, with the door in a 26svh stage, hidden while focus is in the contact form.
- **Do** make reduced motion cut between still states instead of slowing the motion down.
- **Do** set white text on red, every time.
- **Do** keep labels in condensed capitals and sentences in Barlow, with tabular numerals wherever numbers align or count.
- **Do** keep the door's room, floor pool and soft shadow painted in Three.js, inside the canvas.

### Don't:
- **Don't** set ink on red; it reaches only 3.58:1 and white reaches 4.77:1.
- **Don't** use metallic materials or reflections on the door, or bring back real brass, timber or painted panels.
- **Don't** bring back balloon callouts, parts lists, revision tables, title blocks, sheet numbers or drawing vocabulary such as Figures and Notes. The figure stays unlabelled.
- **Don't** dim, fade or delay content to stage a lock, or put a lid over a heading or lead.
- **Don't** name a lock's hardware or security layer in a section tag or heading.
- **Don't** use a border radius in the CSS; the model's soft edges are its material only.
- **Don't** introduce a dark panel, a third accent, or the figure's colours as UI fills.
- **Don't** add soft shadows or glow to the sheet; the stacked menu's overlay shadow is the only one, and the only CSS gradients are the lid's hatch and the stage's fade.
- **Don't** add kickers or eyebrow labels above headings; the lock tag sits beside the section name, not above it.
- **Don't** use icon fonts or glyph icons; icons are inline SVG line paths.
- **Don't** animate on a timer past the one-time load-in; the figure moves from scroll position only, and UI state transitions stay at 120ms to 150ms.
- **Don't** put the direction contract in public HTML; it stays a source comment in the layout.
- **Don't** add a CV link or any invented security claim.
