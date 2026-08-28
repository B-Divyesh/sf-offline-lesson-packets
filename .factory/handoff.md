# Lesson Packet v1 handoff

## Independent verification status: FAIL

Verification date: 2026-08-28 UTC

Tested candidate: `e3f83b4af62fc18ebe78dedbbdc29cd1fd0ba867`

Tested deployment: <https://offline-lesson-packets.sociobot.in/>
Full evidence: [`.factory/verification.md`](verification.md)

The deployed product files match the candidate byte-for-byte and its core
offline authoring/responding workflow works. It is not release-ready under the
acceptance contract because composer activity reorder loses keyboard focus and
the hidden import control draws its focus indicator around “Start over.” Live
hosting also ignores the committed cache/security header rules, and three fresh
Lighthouse mobile runs scored 88/79/82 (median 82) against the 90 performance
gate.

Defects by severity:

- **High:** activity reordering/removal rebuilds the list and drops keyboard
  focus to `<body>`.
- **High:** keyboard focus on the hidden template input visibly outlines the
  unrelated destructive “Start over” control, while the Import label has no
  focus ring.
- **Medium:** live hashed assets and service worker use 30-second revalidation;
  intended immutable/no-cache rules, X-Frame-Options, Permissions-Policy, and
  no-referrer policy are not applied.
- **Medium:** fresh live Lighthouse performance median is 82; TBT is 466–964 ms.
  The runner emitted post-report Chromium crash messages, so repeat in stable CI.
- **Medium:** visible minute values 0/301 silently export as 1/300 without an
  error or normalization in the field.
- **Low:** malformed JSON exposes browser parser jargon.
- **Low:** axe reports one moderate `landmark-unique` result across the root and
  its preview iframe; serious/critical findings are zero.

Independent commands passed: `npm ci` (0 vulnerabilities), `npm test` (7 unit,
10 applicable E2E, 2 intentional skips), and exact `npm run build`. Initial JS
is 24,870 B; CSS is 14,045 B; mobile hero is 28,556 B. Direct `file://` packet
use, TXT response export, template validation/sanitization, local persistence,
storage-denied recovery, print invocation, 1440px/390px rendering, reduced
motion, live service-worker update check, and offline reload passed. There are
no server/API, authentication, billing, library, or CLI checks applicable.

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

The builder's original statement above is superseded by the independent FAIL
status and defects at the top of this handoff.
