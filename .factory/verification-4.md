# Verify teachers can make one offline lesson packet — PASS

Date: 2026-09-06 UTC

Work order: `offline-lesson-packets-verify-4`

Implementation candidate: `ad04d5a77c7cbda2aa166ac7aa875f441d15e826`  
Documentation baseline: `7743be97b71c65fb492c1dfa0cadfe1dda6913a8`

The candidate commit changes product code. The later commits through the
documentation baseline change only `.factory/handoff.md`. The fresh live
artifact comparison therefore reviews `ad04d5a`.

Live URL: <https://offline-lesson-packets.sociobot.in/>

## Verdict

**PASS — zero findings and zero untested claims.**

## Job, audience, and first action

Before scrolling, fresh 1440×1000 desktop and 390×844 phone contexts showed:

| Check | Result |
| --- | --- |
| Job | Make one lesson packet that works offline. |
| Audience | Teachers making an activity, reflection, and exit check for learners. |
| First action | **Try it with sample data**. The adjacent text says it opens a ready-made lesson. |
| Facts | Free; no account; stays on this device. |

The primary action opened `/?demo=1#composer`, set the title to `Demo — Lesson
Packet`, and loaded the realistic “Notice, wonder, connect” lesson with a
checklist, ordered steps, reflection, and exit check.

## Demo, job path, and privacy

- The demo banner is persistent on desktop and phone. At phone scroll position
  2259 it remained at `y=0`, 390×122 px, with **Reset demo** and **Start for
  real** visible.
- A valid pre-existing real draft stayed unchanged while an edited sample was
  written only to `demo:lesson-packet:teacher-draft:v1`. Reset restored the
  sample; Start for real returned the real draft (`Private real draft`).
- A live sample export downloaded `notice-wonder-connect.html` (12,639 bytes)
  without an external URL. A learner completed it and downloaded
  `notice-wonder-connect-response.txt` containing their name, checklist state,
  and reflection.
- Request capture during the demo flow found no off-origin request and no
  console error.
- An activated live service worker completed an update check. A demo reload
  while offline kept the sample title, two activities, offline bar, and page
  title.

## Clean-checkout verification

A new clone of `origin/main` at `7743be9` used Node 22.23.2, npm 10.9.8,
Playwright 1.58.2, and Chromium 1208. `npm ci` installed 141 packages with no
reported vulnerabilities.

| Command or check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — creates `dist/index.html` |
| `npm test` | PASS — 9 unit tests and 45 browser tests; 5 intended project skips |
| Initial JS/CSS | PASS — 26.10 KB raw / 9.10 KB gzip JS; 14.82 KB raw / 4.15 KB gzip CSS |
| Live parity | PASS — every one of 22 public build artifacts byte-matches the fresh build |

## Declared claims

Every exact command in `.factory/claims.json` was run separately after the
clean install. All are outcome tests against the demo or starter data.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS — 1 passed; 1 intended project skip |
| `standalone-response` | PASS — 2 passed |
| `free-demo` | PASS — 2 passed |
| `local-only` | PASS — 2 passed |
| `print-packet` | PASS — 2 passed |
| `template-roundtrip` | PASS — 2 passed |
| `learner-progress` | PASS — 2 passed |
| `template-validation` | PASS — 2 passed |
| `imported-text-safe` | PASS — 2 passed |
| `teacher-draft-recovery` | PASS — 2 passed |

The landing page, legal pages, and README were cross-checked against this
inventory. There are no unlisted, untested public product claims.

## Accessibility, routes, and resilience

- `/opt/fleet/lib/verify-url.sh` passed live root, demo, Privacy, and Terms:
  title, `lang=en`, one h1, main landmark, image alt text, labelled controls,
  and no console errors.
- Axe found zero violations on root, demo, Privacy, Terms, and the designed
  unknown route. The unknown route deliberately returned HTTP 404 and its
  product-styled page is expected behavior.
- The skip link focused `MAIN`; a reduced-motion phone context had 0 overflow
  and effectively instant transition and animation durations (`1e-05s`).
- The repaired phone **Demo** link measured 44×44 px. All primary phone nav
  links measured at least 44 px in both dimensions.
- Live headers provide the committed same-origin CSP, `no-referrer`,
  permissions policy, SAMEORIGIN, nosniff, immutable hashed-asset caching, and
  `no-cache` service-worker caching. All site and external source links return
  successfully.
- Fresh Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 904 ms, LCP 946 ms, TBT 33 ms, CLS 0.

Normal export and response paths, invalid templates, text-safety imports,
1/300-minute boundaries, malformed JSON recovery, draft storage failure,
keyboard activity movement/removal, learner-save clearing, and import-focus
truthfulness are covered by the clean 45-test browser suite. The live byte
comparison ties that candidate evidence to production.

## Earlier finding disposition

All earlier findings in `verification.md`, `verification-2.md`,
`verification-3.md`, and `review-1.md` remain repaired: keyboard focus,
import focus, cache/security policy, performance, time normalization, recovery
copy, preview landmark naming, skip-link focus, persistent phone demo controls,
demo title, claim inventory, route navigation, plain headings, readable first
action text, and the phone Demo touch target. The final item was independently
remeasured at 44×44 px on the live phone page.

## Applicability

This is a free static web product. It has no backend, shared database, tenant,
account, payment, health endpoint, rate limit, CLI/library package, or desktop
artifact. Those checks do not apply. AI generation is outside the researched
product scope.

## Evidence

- `/work/.evidence/verification-4/desktop-first-screen.png`
- `/work/.evidence/verification-4/phone-first-screen.png`
- `/work/.evidence/verification-4/desktop-demo.png`
- `/work/.evidence/verification-4/phone-demo.png`
- `/work/.evidence/verification-4/verify-*/verify.json`
- `/work/.evidence/verification-4/lighthouse.json`

No product code was changed during this verification.
