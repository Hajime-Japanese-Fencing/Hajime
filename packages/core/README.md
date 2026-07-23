# @hajime/core

Framework-agnostic business and application core for the competition management applications.

## Responsibilities

- Domain models and business rules
- Application use cases and state façades
- Ports implemented by outer applications
- Public contracts shared with UI and application packages

## Boundaries

This package does not contain Vue code, browser integrations, persistence implementations, HTTP clients, or concrete adapters. Outer applications create adapters and inject them through core ports.

Internal stores, factories, and helper types are not part of the public package API.

## Development

```bash
rtk vp run --filter @hajime/core test
rtk vp run --filter @hajime/core check
rtk vp run --filter @hajime/core build
```

## Architecture

See [`docs/architecture/core.md`](../../docs/architecture/core.md) for dependency rules, feature structure, shared-domain criteria, and public API conventions.
