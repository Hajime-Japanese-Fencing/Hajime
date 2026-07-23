# Core Architecture

## Purpose and boundaries

`@hajime/core` contains the business rules, application orchestration, state, and ports shared by the applications. It is framework-agnostic and must not depend on Vue, browser APIs, HTTP clients, persistence libraries, or concrete adapters.

Concrete adapters and dependency composition belong to outer applications. The current composition root is under `apps/main/src/bootstrap/container/`.

## Dependency rule

Dependencies point toward the business core:

- `domain/` contains pure business models, value objects, and services. It has no technical dependencies.
- `application/` coordinates domain behavior, ports, and application state. TanStack Store is allowed here.
- `ports/` contains contracts implemented by outer layers. Ports may depend on public domain or application data contracts, but never on adapters.
- Adapters depend on core ports and live outside `@hajime/core`.

A feature must not import implementation details from another feature. Stable concepts shared by multiple features belong in `shared/`.

## Feature structure

Use vertical slices organized by business capability:

```text
<feature>/
├── domain/
├── application/
├── ports/
└── __test__/
```

Create only the layers required by the feature. Empty directories do not improve architecture and must not be added.

Nested business capabilities may keep domain submodules below `domain/`:

```text
pool/
└── domain/
    ├── distribution/
    ├── fight/
    └── setup/
```

Tests stay next to the unit they exercise. Shared test factories, fakes, and spies belong in the closest `__test__/` directory.

## Application state

TanStack Store is an application concern. Store façades may be public when applications consume them, but their internal stores, factories, patches, and state-management helpers remain private to the feature.

## Read query exception

A read-only query port may be consumed directly without an `application/` layer when it performs no orchestration, validation, or business transformation. Add an application use case when any of those responsibilities appears.

`competition-overview` currently follows this exception.

## Shared domain

An element belongs in `shared/` only when it is:

1. a pure business concept;
2. stable and independent of a feature implementation;
3. used by at least two feature slices.

Feature-specific records, application state, ports, and helpers remain in their owning feature.

## Public package API

The root and feature barrels expose contracts for package consumers, not the complete source tree.

Export:

- feature façades and callable use cases;
- ports implemented by outer applications;
- public domain types used across package boundaries;
- input and output types required by those contracts.

Do not export:

- internal stores and their factories;
- state patch or implementation helper types;
- test utilities;
- domain services that are implementation details of a public use case.

Before removing an export, search all `@hajime/core` imports and run checks for every consuming package.

## Dependency composition

Outer applications instantiate concrete adapters and inject them into core use cases or store façades. Core code must never import an adapter or instantiate infrastructure.

## Testing

- Domain tests use pure inputs and outputs without technical mocks.
- Application tests use fakes or spies implementing ports.
- Adapter integration tests live with their outer application or infrastructure package.
- Structural changes must preserve behavior and keep the package test suite green.

## Validation

Run at least:

```bash
rtk vp run --filter @hajime/core test
rtk vp run --filter @hajime/core check
```

When the public API changes, also check every consuming package, including `@hajime/main` and `@hajime/ui`.
