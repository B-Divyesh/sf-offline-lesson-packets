# Verify teachers can make one offline lesson packet — PASS

Date: 2026-09-06 UTC

Work order: `offline-lesson-packets-verify-3`

Implementation candidate: `a015482f28f0182e54688100dc30d0df6d51d64f`  
Documentation baseline: `bc085f917f3cbba62359e4c8e9964ba7337de01f`  
The implementation is `a015482`; `1b94adf` and `bc085f9` are later report-only
documentation commits.

Live URL: <https://offline-lesson-packets.sociobot.in/>

Environment: Node.js `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, Chromium
1208, Lighthouse current npx release.

## Verdict

**PASS — zero findings and zero untested claims.**

Teachers can make a small interactive activity with reflection and exit check,
download one self-contained HTML packet, and learners can complete, print, and
download a readable response without an account or server-side record.

## Job, audience, and first action

Fresh desktop and 390×844 phone contexts were checked before scrolling.

| Check | Live result |
| --- | --- |
| Job | Make one lesson packet that works offline. |
| Audience | Teachers building an activity, reflection, and exit check for learners. |
| First action | **Try it with sample data**; it opens a ready-made lesson. |

The actual action opened `/?demo=1#composer`, displayed `Demo — Lesson Packet`,
the persistent sample banner, Reset demo, Start for real, and the populated
“Notice, wonder, connect” lesson. Desktop and phone previews each had its title,
three checklist items, three ordered steps, reflection, and exit check.

## Clean-install quality gates

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed; 0 vulnerabilities reported. |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — creates `dist/index.html` |
| `npm test` | PASS — 9 unit + 44 browser tests; 4 intended skips |
| JS / CSS budgets | PASS — 26.10 KB raw / 9.10 KB gzip; 14.79 KB raw / 4.14 KB gzip |
| Live artifact parity | PASS — all 22 published files byte-match the fresh build |

## Declared claims

All commands exactly as declared in `.factory/claims.json` passed after `npm ci`.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS — 1 passed; 1 intended mobile-project skip |
| `standalone-response` | PASS — 2 passed |
| `free-demo` | PASS — 2 passed |
| `local-only` | PASS — 2 passed |
| `print-packet` | PASS — 2 passed |
| `template-roundtrip` | PASS — 2 passed |
| `learner-progress` | PASS — 2 passed |
| `template-validation` | PASS — 2 passed |
| `imported-text-safe` | PASS — 2 passed |
| `teacher-draft-recovery` | PASS — 2 passed |

The inventory covers public offline use, no-account demo, local-only privacy
and demo isolation, export/printing, templates, learner progress,
validation/sanitization, and draft recovery. **Untested claim count: 0.**

## User paths and live behavior

- PASS — a real draft named “Private real draft” remained unchanged during demo
  edits, which used only `demo:lesson-packet:teacher-draft:v1`. Reset restored
  the original sample, and Start for real discarded demo state and restored the
  real draft.
- PASS — request capture found no off-origin request during desktop or phone
  flows.
- PASS — a service-worker-controlled demo reloaded offline with sample title,
  visible offline bar, JavaScript, and CSS intact.
- PASS — full browser suite covers normal export/print/response download;
  invalid templates; time boundaries; malformed JSON recovery; unsafe imported
  text; local-save clear; storage failure; validation; focus restoration;
  reduced motion; and mobile overflow.

## Accessibility, routes, privacy, and performance

`/opt/fleet/lib/verify-url.sh` passed live root, demo, Privacy, and Terms:
title, `lang=en`, a single h1, main landmark, alt text, labeled buttons, and no
console errors. `@axe-core/playwright` scans on root, demo, Privacy, Terms, and
unknown route returned zero violations. `@axe-core/cli` could not find a system
Chrome in this worker, so the installed Playwright axe integration used the
pinned preinstalled Chromium and produced complete scans.

The skip link focused `MAIN` at desktop and phone widths. The deliberate
unknown route returns HTTP 404 with the product-styled `Page not found` page,
one h1/main, navigation, and a return action. This is an expected 404, not a
defect.

Live headers include same-origin CSP, `Referrer-Policy: no-referrer`,
permissions policy, `X-Frame-Options: SAMEORIGIN`, immutable hashed assets, and
`Cache-Control: no-cache` for `sw.js`.

Fresh Lighthouse mobile: Performance 99, Accessibility 100, Best Practices
100, SEO 100; LCP 1.093 s, TBT 96.5 ms, CLS 0. Its known post-report Chromium
tab-crash message appeared after valid JSON was written.

## Earlier review disposition

| Earlier item | Current evidence |
| --- | --- |
| Reorder/removal and import focus | Passing browser regressions retain and present focus truthfully. |
| Cache/security policy and performance | Live headers pass; Lighthouse is 99. |
| Time feedback, JSON recovery, landmark name | Passing regressions verify all three. |
| Skip-link focus, phone banner, demo title | Live desktop/phone checks pass. |
| Three formerly unlisted claims | Three declared exact passing commands now exist. |
| Route navigation, direct headings, text baseline | Current browser regressions pass. |

## Evidence

- `/work/.evidence/verification-3-claims/`
- `/work/.evidence/verification-3-live.json`
- `/work/.evidence/verification-3-live-desktop.png`
- `/work/.evidence/verification-3-live-phone.png`
- `/work/.evidence/verification-3-live-axe.json`
- `/work/.evidence/verification-3-live-parity.txt`
- `/work/.evidence/verification-3-lighthouse.json`
- `/work/.evidence/verification-3-url-root/verify.json` (plus demo, privacy,
  and terms directories)

No product code was changed during this verification.
