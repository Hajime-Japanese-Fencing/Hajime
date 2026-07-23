---
name: core-architecture
description: Apply the core package dependency, feature structure, shared-domain, port, and public API rules when creating, moving, or reviewing core source files.
---

# Core Architecture

Use this skill for structural or API changes under `packages/core`.

## Source of truth

Read [`docs/architecture/core.md`](../../../docs/architecture/core.md) before making changes. Do not duplicate or override its decisions in this skill.

## Workflow

1. Identify the owning business feature.
2. Classify each changed file as domain, application, port, test support, or outer adapter.
3. Verify that dependencies point inward and that no concrete adapter enters the core package.
4. Avoid creating empty layer directories.
5. Check whether each exported symbol is required by a package consumer or an outer adapter.
6. Search all imports from `@hajime/core` before changing a public export.
7. Keep tests colocated with the unit under test and shared doubles in the closest `__test__/` directory.
8. Run the core tests and checks. Check consuming packages when the public API changes.

## Required validation

```bash
rtk vp run --filter @hajime/core test
rtk vp run --filter @hajime/core check
```
