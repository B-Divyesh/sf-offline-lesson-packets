# Lesson Packet

Lesson Packet lets a teacher compose a small interactive lesson and download it
as one self-contained HTML file. A packet can contain checklists, reorderable
steps, short responses, a reflection, and an exit check. Learners can print it
or download a plain-text response record. There are no accounts, subscriptions,
analytics, or server-side student records.

Live site: <https://offline-lesson-packets.sociobot.in>

## Who it is for

Teachers, tutors, librarians, and facilitators who need a durable activity that
still works on intermittent connections, shared computers, USB drives, or a
local network. It sits between a paper worksheet and a full LMS.

## Privacy and portability

The composer stores the current teacher draft in browser local storage. Lesson
content is never uploaded. An exported packet is a single HTML document with
all styles and behavior inline; it makes no network requests. Teachers can
optionally let a packet remember learner progress in that learner's browser.
Response export is a local `.txt` download.

Imported templates are JSON-only. Their shape, types, counts, and text lengths
are checked before use, and lesson text is never interpreted as HTML.

## Develop

Requirements: Node.js 20+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The production build command from the work
order is:

```sh
npm run build
```

It creates `dist/` with `dist/index.html` at the deploy root, plus `/privacy/`
and `/terms/` routes. Azure Static Web Apps can publish that directory directly.

## Test

Playwright 1.58.2 is pinned because that browser version is provided by the
factory worker image.

```sh
npm test          # unit tests, desktop E2E, mobile E2E, axe checks
npm run test:unit
npm run test:e2e
```

## Project notes

- `.factory/brief.json` records the product scope.
- `.factory/design.md` records the visual system and generated-art provenance.
- `.factory/handoff.md` records verification results and known gaps.
- `assets/src/` contains the original generated hero and its exact prompt.

## License

MIT. See [LICENSE](LICENSE).
