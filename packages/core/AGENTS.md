# Core Package

- Keep this package framework- and infrastructure-agnostic.
- Do not import Vue, browser APIs, HTTP clients, storage libraries, or application adapters.
- Keep pure business models and rules in `domain/`.
- Keep orchestration and TanStack Store state in `application/`.
- Define contracts implemented by outer layers in `ports/`; concrete adapters belong outside this package.
- A direct read query port may omit `application/` when it has no orchestration, validation, or business transformation.
- Do not create empty layer directories.
- Export only consumer-facing contracts from `src/index.ts` and feature barrels.
- Do not export internal state stores, factories, helper types, or implementation details.
- Read `docs/architecture/core.md` before structural changes.
- Run `rtk vp run --filter @hajime/core test` and `rtk vp run --filter @hajime/core check` after changes.
