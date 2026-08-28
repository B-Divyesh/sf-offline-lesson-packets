# Lesson Packet visual system

## Thesis: the classroom print bench

Lesson Packet should feel like a careful teacher assembled it at a well-used
risograph table: tactile, direct, inexpensive, and made to travel. The product
uses overlapping paper shapes, offset ink, dotted registration marks, and a
slight grain instead of glossy software chrome. Decoration explains the job:
loose sheets become one clipped, durable packet. It never imitates an LMS
dashboard.

The page grain uses a tiny CSS radial ink pattern rather than a live SVG noise
filter. It keeps the tactile surface while avoiding full-viewport filter work
on low-end phones. The exact packet preview waits until it approaches the
viewport; the hero and composer controls remain immediately available.

The treatment is intentionally light-mode only. A warm paper field is central
to the print-room metaphor, and packets themselves must preview close to their
printed appearance. The background is painted explicitly and all text/UI
contrasts are designed for it.

## Palette

- `paper #F4EBD8`: the canvas, drawn from unbleached worksheet stock.
- `sheet #FFFDF7`: writable and preview surfaces.
- `ink #18231F`: near-black green, softer than digital black; body contrast
  13.9:1 on paper.
- `muted #58635C`: pencil-note text; 5.5:1 on paper.
- `violet #5A36A3`: primary risograph pass; white text exceeds 7:1.
- `violet-dark #3C2474`: pressed and focus-support state.
- `orange #E65E36`: second ink pass used for marks and emphasis, never as the
  sole state indicator.
- `orange-dark #963719`: accessible text/accent on light surfaces.
- `success #216B52`, `warning #8A5200`, `danger #A33131`: status roles, always
  paired with words or symbols.
- `focus #0B6E75`: a two-pixel outline plus paper-colored gap.

## Typography

Two dependency-free system stacks keep every packet truly portable. Headings
use `Georgia, Cambria, Times New Roman, serif`: a bookish editorial voice with
distinctive numerals. Controls and body copy use `Arial, Helvetica, sans-serif`
for familiar classroom legibility. Body text is 16px minimum, with 1.5 line
height; forms use 16px to prevent mobile zoom. The scale is 16, 18, 22, 30,
44px. Labels use weight and spacing instead of tiny type.

## Spacing and shape

The base unit is 4px, with an 8/12/16/24/32/48 rhythm. Content tops out at
1180px and reading measures at 68 characters. Corners are clipped or modestly
rounded (2–10px); paper shadows are hard, offset ink-colored blocks rather than
blurred generic cards. Controls are at least 44px tall with 8px between targets.

## Interaction grammar

- Violet is for “make or move forward”; orange marks the current sheet or a
  freshly changed region.
- Composer sections resemble stacked source sheets; the preview resembles a
  sheet on a registration mat.
- Additions enter from their point of origin and settle by 8px. Reordering uses
  paired arrow controls so it remains exact on touch and keyboard.
- Every mutation has immediate prose feedback in a polite live region. Delete
  is confirmed and exports report validation errors at the relevant fields.
- Demo mode uses a vermilion proof-strip banner. Its reset and real-work exit
  stay visible without being confused with packet controls.
- On a 390px phone, the preview moves below the composer and peripheral hero
  notes disappear; all authoring and export actions remain available.

## Motion policy

UI transitions last 180–220ms and animate only opacity and transform. The
illustration has one short page-settling entrance; nothing loops. Under
`prefers-reduced-motion: reduce`, smooth scrolling and transforms are removed,
and state changes are instant while hierarchy remains through color, spacing,
and layering.

## Original asset plan and provenance

The hero image is an original AI-generated still-life illustration of an
offline lesson packet on a risograph worktable. It shows tangible packet parts
(instruction page, checklist, ordered strips, pencil, paperclip) without fake
application UI or text, clarifying the transition from loose lesson pieces to
one portable file. Small registration marks and icons elsewhere are authored
in CSS/SVG in this repository.

Prompt sheet:

> Use case: stylized-concept. Asset type: wide landing-page hero illustration.
> Scene: overhead risograph printmaking table with one warm white lesson packet,
> three offset paper layers, blank checklist marks, movable blank paper strips,
> a reflection writing area, wooden pencil, and oversized orange paperclip.
> Style: tactile editorial paper collage, two-pass risograph screenprint,
> visible soy-ink grain, slightly imperfect registration, cut-paper edges,
> restrained geometric composition. Composition: landscape, centered packet,
> generous calm negative paper space, no people. Lighting: flat soft studio
> light. Palette: warm unbleached paper, deep forest ink, saturated violet,
> vermilion orange. Constraints: all sheets blank; no legible text, letters,
> numbers, logos, UI screenshots, gradients, photoreal hands, watermark, or
> copyrighted characters.

Generation: Azure AI Foundry `factory-image` via
`/opt/fleet/lib/gen-image.sh`, 2026-08-28. The selected original is stored in
`assets/src/` with its prompt sidecar, then exported to responsive WebP sizes.
No third-party visual assets or fonts are used. Generated-image disclosure is
included in the footer.

The 1200×630 social preview and 180×180 touch icon are crops of the same
generated hero, produced locally with ImageMagick on 2026-08-28. They add no
new source material or license.
