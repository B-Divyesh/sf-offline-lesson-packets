# Verify teachers can make one offline lesson packet — FAIL

Date: 2026-09-05 UTC

Work order: `offline-lesson-packets-verify-2`

Live URL: <https://offline-lesson-packets.sociobot.in/>

Implementation candidate: `545d9f0ba4e8fcf9233709dfdd0593e82cf6d987`

Documentation baseline: `545d9f0ba4e8fcf9233709dfdd0593e82cf6d987`
(the same commit; it also contains the last demo-banner markup change)

Environment: Node.js `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`,
Chromium `1208`, Lighthouse `12.8.2`

## Verdict

**FAIL — 7 findings and 3 untested public claims.**

The main teacher-to-learner workflow works. The sample is isolated, realistic,
resettable, and available offline. Every declared claim command passes. The
live artifact matches the candidate. Acceptance still requires zero findings
and zero untested claims, so the issues below block a PASS.

## Job, audience, and first action

Before scrolling in fresh desktop and 390×844 phone contexts:

- Job: make one lesson packet that works offline.
- Audience: teachers building an activity, reflection, and exit check for
  learners.
- First action: **Try it with sample data**. The adjacent text says it opens a
  ready-made lesson and needs no account.

The three facts shown with the action are “Free,” “no account,” and “stays on
this device.” The job and action are clear on both screen sizes.

## Findings

### High — The skip link does not move keyboard focus into main content

On the live root page, focus **Skip to main content** and press Enter.
`location.hash` becomes `#main`, but `document.activeElement` becomes `BODY`,
not `MAIN`. From the tested composer position, the page also remained at
`scrollY=2708`. The focus ring itself is visible and measures 3 px, but the
skip action does not bypass repeated navigation. The same non-focusable
`<main id="main">` pattern is present on the legal and 404 pages.

This fails the attached keyboard baseline. Add a programmatically focusable
main target and test the focus destination, not only the link or hash.

### Medium — The demo label and exit controls scroll away on a phone

At 390×844, entering the one-click sample and scrolling to the packet preview
leaves the demo banner outside the viewport. Computed position is `static` and
`bannerInViewport` is false. Desktop uses `position: sticky` and keeps it in
view. The demo contract requires a persistent sample label with **Reset demo**
and **Start for real**; the mobile override removes that protection while a
teacher is editing sample data.

### Medium — The demo URL has the landing-page title

`/?demo=1` reports `Lesson Packet — make one-file offline activities`, the
same title as `/`. The route-title contract requires a title that identifies
the demo state, such as `Demo — Lesson Packet`. This matters when the sample
opens in a new tab and for screen-reader page announcements.

### Medium — Three public claims are absent from the claim inventory

All seven entries in `.factory/claims.json` pass, but public copy makes three
additional promises without one exact `@claim:` browser test each:

1. `README.md` says template shape, types, counts, and text lengths are checked
   before use.
2. `README.md` says imported lesson text is never interpreted as HTML.
3. `/privacy/` says saving a teacher draft prevents an accidental refresh from
   erasing the work.

Some unit tests and this verification exercise parts of the first two
behaviors, and the implementation visibly restored normal drafts. They are
still missing from `.factory/claims.json`, and no declared claim command proves
each complete public statement. This is one claim-inventory finding with
`untested_claim_count: 3`.

### Low — Header navigation changes between routes

The root header has Demo, How it works, and Make a packet; it has no Privacy
link. Privacy and Terms retain only Make a packet, and the designed 404 retains
no navigation links. The route skeleton requires a consistent header with the
wordmark and stable primary navigation, including Privacy.

### Low — Some route headings use mood or metaphor instead of the page job

The designed 404 uses `A loose sheet`, and Terms uses `A simple tool, plainly
offered` as section kickers. These lines do not name content or an action and
conflict with the attached no-metaphor, no-mood-heading rule. Use direct labels
such as `Page not found` and `Terms of use`.

### Low — Required first-action details render below the 16 px text baseline

The sentence explaining the sample and the three first-screen facts use the
`.microcopy` rule at 13 CSS px on desktop and phone. This is required decision
text, not incidental decoration. The attached clarity baseline sets body text
at 16 px or larger.

## One-click sample and real-data isolation

Fresh live desktop and phone contexts opened the populated “Notice, wonder,
connect” lesson in one click. It contains a subject, instructions, two filled
activity blocks, a reflection, an exit check, and a rendered learner preview.
The downloaded file was `notice-wonder-connect.html`; it contained the lesson
and no external URL.

Isolation was checked with a real draft named “Private real draft”:

- demo edits wrote `demo:lesson-packet:teacher-draft:v1`;
- the real `lesson-packet:teacher-draft:v1` value did not change;
- **Reset demo** restored the original sample without changing the real key;
- **Start for real** removed the demo key and restored “Private real draft.”

The demo and its preview had zero axe violations. No off-origin request was
made during the desktop flow.

## Declared claims

Each command was run exactly as listed from the fresh checkout after
`npm ci`.

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — 1 passed, 1 intended project skip |
| `standalone-response` | `npm run test:e2e -- --grep @claim:standalone-response` | PASS — 2 passed |
| `free-demo` | `npm run test:e2e -- --grep @claim:free-demo` | PASS — 2 passed |
| `local-only` | `npm run test:e2e -- --grep @claim:local-only` | PASS — 2 passed |
| `print-packet` | `npm run test:e2e -- --grep @claim:print-packet` | PASS — 2 passed |
| `template-roundtrip` | `npm run test:e2e -- --grep @claim:template-roundtrip` | PASS — 2 passed |
| `learner-progress` | `npm run test:e2e -- --grep @claim:learner-progress` | PASS — 2 passed |

The claim commands do not clear the finding for the three unlisted public
claims above.

## Clean-checkout quality gates

The independent checkout started clean at the exact candidate SHA.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed, 142 audited, 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — `dist/` created with `index.html` at its root |
| `npm test` | PASS — 9 unit tests; 29 browser tests passed; 3 intentional project skips |
| Initial JavaScript | PASS — 26,753 B raw / 9.37 kB gzip |
| Initial CSS | PASS — 14,487 B raw / 4.07 kB gzip |
| Mobile hero | PASS — 28,556 B |
| Fonts | PASS — system stacks; no font download |

## Normal, invalid, boundary, and recovery paths

- PASS — made and downloaded the realistic sample packet.
- PASS — the standalone packet and readable response export pass the declared
  desktop and mobile claim test.
- PASS — an empty title and no activities produced a focused error summary
  with links to both problems.
- PASS — activity reorder focused `Move activity 2 up`; removal focused
  `Remove activity 1`.
- PASS — the hidden import control placed its visible outline on Import
  template and not Start over.
- PASS — 0 became 1 minute and 301 became 300 minutes, with exact visible
  explanations.
- PASS — malformed JSON used the plain recovery message. Unsupported versions,
  21 activities, 21 items, and a 200,001-byte file were rejected.
- PASS — 20 activities imported; adding a twenty-first block was blocked.
- PASS — script, image-handler, and SVG-handler text stayed inert in preview.
- PASS — canceling Start over preserved work; confirming restored the starter.
- PASS — corrupt stored JSON recovered to the starter without a page error.
- PASS — forced storage failure reported `Draft could not be saved` and still
  exported `still-exportable.html`.

## Accessibility, mobile, and motion

- Live root, demo, privacy, terms, 404, and mobile demo axe scans: 0 violations.
- The worker `verify-url.sh` passed root, demo, privacy, and terms with correct
  title presence, `lang=en`, one h1, a main landmark, alt text, and no console
  errors.
- Desktop 1440×1000 and phone 390×844 had no horizontal overflow.
- Visible controls use designed focus rings. The import-label, reorder, removal,
  validation-summary, native-dialog, and learner controls were exercised with
  the keyboard.
- `prefers-reduced-motion: reduce` matched; scrolling became `auto`, and UI
  transition/animation duration became effectively instant.
- The 22×22 remember-progress checkbox has a larger associated label target;
  the 1×1 file input has a full-size visible label target.

The skip-link and 13 px findings remain despite the otherwise clean automated
accessibility results.

## Offline, links, routes, and live deployment

- The live service worker activated and `registration.update()` completed.
  After network access was disabled, `/?demo=1` reloaded with the offline bar,
  sample title, two activity blocks, JavaScript, and CSS intact.
- Root, demo, privacy, terms, and the product’s own GitHub source link returned
  200. Hash targets for How it works and the composer exist.
- The deliberate unknown URL returned HTTP 404 with the styled page, correct
  title, one h1, one main landmark, a return action, and zero axe violations.
  This expected 404 is not a defect; its browser console resource message is
  also not counted as an unexpected error.
- Root, legal, and 404 responses include the committed CSP, no-referrer policy,
  Permissions Policy, SAMEORIGIN, and nosniff. Hashed JS/CSS use one-year
  immutable caching; `/sw.js` uses `no-cache`.
- Root, privacy, terms, designed 404 body, service worker, robots, sitemap,
  hashed JS/CSS, both hero images, and social image match the fresh candidate
  build byte for byte.

This is a static product. Backend tenancy, database restart persistence,
health endpoints, and 429/Retry-After checks do not apply. There is no CLI,
library, desktop installer, sign-in, billing, or paid feature.

## Performance

Lighthouse `12.8.2` mobile produced valid JSON in three fresh live runs. The
launcher reported its known post-report tab crash, but each complete report was
read successfully.

| Run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 1.056 s | 35.5 ms | 0 |
| 2 | 100 | 100 | 100 | 100 | 1.052 s | 0.5 ms | 0 |
| 3 | 100 | 100 | 100 | 100 | 1.015 s | 0 ms | 0 |

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Activity reorder/removal lost focus | Repaired — exact live and local focus targets pass |
| Import showed focus on Start over | Repaired — Import template has the outline; Start over does not |
| Live cache/security policy missing | Repaired — every committed header checked live |
| Live Lighthouse below 90 | Repaired — three fresh runs scored 100 |
| Time input silently differed from export | Repaired — editor, message, and preview agree at both bounds |
| Malformed JSON exposed parser jargon | Repaired — exact plain recovery message shown |
| Preview main landmark lacked a name | Repaired — `aria-label="Lesson packet"`; axe result absent |

All seven earlier findings have direct passing evidence. The seven findings in
this report are independent acceptance gaps.

## Evidence

- `/work/.evidence/live-desktop-first-screen.png`
- `/work/.evidence/live-desktop-demo.png`
- `/work/.evidence/live-phone-first-screen.png`
- `/work/.evidence/live-phone-demo.png`
- `/work/.evidence/verify-root/verify.json`
- `/work/.evidence/verify-demo/verify.json`
- `/work/.evidence/verify-privacy/verify.json`
- `/work/.evidence/verify-terms/verify.json`
- `/work/.evidence/lighthouse-live-1.json`
- `/work/.evidence/lighthouse-live-2.json`
- `/work/.evidence/lighthouse-live-3.json`

No product code was changed during this verification.
