# Agent guide — a1-workshop.github.io

**Org:** A1 Workshop (independent). Remotes stay independent; local siblings under `~/src/a1-workshop/` are not a monorepo.

Public brochure HTML is not Cursor instructions. Standing policy lives here and in `.cursor/rules/`.

## Hub law

- This repo is the **org brochure** only. Do **not** vendor course trees from `a1-inventor` or `almost-open`.
- Curriculum SSOTs stay in sibling repos; link their live Pages URLs.
- Public workshop titles: **AI Driven Invention** (`a1-inventor`) and **How To Make (almost) Anything** (`almost-open`).
- Header nav is Workshops-first — do not restore per-workshop top tabs on the home page.
- Inventor gate demo SSOT is `https://a1-workshop.github.io/a1-inventor/lab/gate-lite.html`. Keep thin redirects at `/lab/gate-lite.html` and `/inventor/lab/gate-lite.html`.
- Keep `/inventor/` as the AI Driven Invention brochure (weeks language, not Track ladder).
- Static HTML/CSS only — no Eleventy in this repo.

## Brand / visual

- Light reading-first theme aligned with the course sites (teal accent, Source Sans/Serif).
- Independent A1 Workshop brand — no third-party affiliation language.

## Scoped rules

Hub HTML/CSS authoring: [`.cursor/rules/hub.mdc`](.cursor/rules/hub.mdc).
