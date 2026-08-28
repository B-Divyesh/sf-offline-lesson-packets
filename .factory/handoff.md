# Lesson Packet v1 handoff

Work order: `offline-lesson-packets-build-1`

Completed: 2026-08-28

Deploy class: static web (`dist/`)

## What shipped

- A Vite + vanilla TypeScript composer for a complete small lesson: title,
  subject, time, instructions, checklist / put-in-order / short-response
  activity blocks, reflection, and exit check.
- Activity add, remove, and reorder controls with confirmation for destructive
  removal, visible focus states, 44px targets, inline validation, an error
  summary, live status feedback, and a deliberate empty state.
- Device-local teacher draft autosave plus editable JSON template download and
  import. Imports enforce schema, block/item limits, valid activity types, and
  text lengths; imported IDs are regenerated. User content is inserted as text
  and escaped in exported markup.
- A self-contained HTML learner packet with no external dependencies. Learners
  can check items, drag or use arrow buttons to reorder steps, write responses,
  print cleanly, optionally remember progress locally, clear saved progress,
  and download a teacher-readable `.txt` response.
- A sandboxed exact packet preview, responsive authoring at 390px, a service
  worker-backed offline composer shell, offline status, `/privacy/` and
  `/terms/`, robots/sitemap files, and static-host security/cache headers.
- A product-specific risograph print-bench design. The original generated hero,
  generation metadata, and exact prompt are in `assets/src/`; responsive WebP
  exports are 28 KB and 109 KB. Provenance and the complete visual system are
  recorded in `.factory/design.md`.

## Run and verify

```sh
npm install
npm test
npm run build
npm run preview
```

`npm run build` is the exact work-order build command. It creates
`dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html`.

Verification completed on 2026-08-28:

- `npm test`: 7 unit tests passed; 10 applicable Chromium desktop/mobile E2E
  tests passed; 2 intentional per-project skips.
- E2E covers the teacher-to-learner download flow, the exported packet runtime,
  response export contents, sorting, checklist state, empty/error handling,
  console errors, legal routes, 390px horizontal overflow, axe serious/critical
  checks, and a browser reload with the network disabled.
- `npm run build`: passed. Initial production JavaScript is 24,870 bytes and
  CSS is 14,045 bytes (both uncompressed), below the 200 KB / 50 KB budgets.
- Lighthouse 12.8.2, mobile defaults against the production preview: Performance
  100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.0s, CLS 0, total
  blocking time 0ms, speed index 1.0s.
- Manual inspection completed at 1440px and 390px. Hero and preview rendering,
  stacking, touch targets, focus treatment, and paper-print hierarchy were
  checked. No third-party runtime requests or console errors were observed.
- `npm install` reported zero known vulnerabilities.

## Known gaps and next steps

- Interface and generated packet copy are English-only in v1.
- Local drafts intentionally follow one-browser / one-device semantics; clearing
  site data clears the draft. Teachers should download JSON templates for
  durable backups.
- Lighthouse provides lab measurements rather than field INP data. There is no
  analytics by design, so real-world performance should be sampled manually if
  the product is later expanded.
- A future version could add optional choice / matching activity types and a
  printable teacher answer key without changing the one-file privacy model.

There are no blocking gaps for the researched smallest useful product.
