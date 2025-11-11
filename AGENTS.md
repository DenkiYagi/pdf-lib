# AI Agent Briefing

## Mission & Purpose
- `@denkiyagi/pdf-lib` extends the upstream `pdf-lib` to power PDF generation for `yagisan-reports`, a PDF report generation engine.
- Current focus areas: richer custom font handling via `@denkiyagi/fontkit`, groundwork for improved error handling, adding PDF encryption support, and fixing upstream bugs.
- Keep the fork aligned with upstream quality while preserving `yagisan-reports`-specific behaviors; prefer additive changes and call out intentional divergences in `MODIFICATIONS.md` or `MODIFICATION-DEVELOPMENT.md`.

## Project Orientation
- `src/` – Primary TypeScript source for the library; exports must remain framework-agnostic and compatible with browsers and Node.
- `tests/` – Jest-powered regression coverage.
- `apps/` – Example and manual-test harnesses used to validate real-world document flows.
- `assets/` – Sample PDFs, fonts, and images consumed by docs and tests; treat as fixtures when updating expectations.
- `build/`, `rollup.config.mjs`, `tsconfig.json`, `jest.json` – Tooling scaffolding for bundling, type emission, and tests.
- `docs/` – Markdown/docs site material mirrored from upstream; update only when behavior changes.
- `scratchpad/` – Throwaway experiments; do not rely on contents for production logic.

## Tech Stack
- Node.js 20+ runtime, Yarn package manager.
- TypeScript 4.x across source and typings.
- Critical dependency: `@denkiyagi/fontkit` (our fork) powers font parsing, embedding, and subsetting.

## Common Commands
- `yarn typecheck` – Checks TypeScript types across the codebase.
- `yarn lint` – Runs the lint rules expected by CI; fix warnings locally to avoid pipeline noise.

## Helpful References
- Change log: `MODIFICATIONS.md` (what differs from upstream).
- Dev workflow, release, and scripting notes: `MODIFICATION-DEVELOPMENT.md`.
- Upstream behavior context: `README.md` plus linked docs/examples.
