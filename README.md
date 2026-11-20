# A1 Workshop — org hub

Org root GitHub Pages site for **A1 Workshop**: a multi-workshop brochure, not a single-course proposal.

**Live:** [https://a1-workshop.github.io](https://a1-workshop.github.io)

## Workshops

| Path / URL | Workshop |
|------------|----------|
| [`/inventor/`](https://a1-workshop.github.io/inventor/) | AI-Powered Inventor — proposal + `Gate_Circuit_lite` demo |
| [almost-open](https://a1-workshop.github.io/almost-open/) | How To Make (almost) Anything, Open — Eleventy course site (project Pages) |

Curriculum SSOTs stay in sibling repos ([`a1-inventor`](https://github.com/a1-workshop/a1-inventor), [`almost-open`](https://github.com/a1-workshop/almost-open)). This hub does **not** vendor course trees.

## Contents

| Path | Role |
|------|------|
| `index.html` | Org hub landing (workshop index) |
| `inventor/` | Inventor proposal packet + lab demo |
| `lab/gate-lite.html` | Redirect → `/inventor/lab/gate-lite.html` |
| `styles.css` / `assets/` | Shared visual system |

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Brand

**A1 Workshop**, in partnership with **Humanmade**.  
Tagline: Agentic and harness engineering workshops for inventors and engineers.
