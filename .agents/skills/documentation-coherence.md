---
name: documentation-coherence
description: Règles de cohérence entre les documents du projet (project brief, index des use cases, etc.). Utilise quand tu crées ou modifies de la documentation pour vérifier et maintenir la cohérence entre tous les documents existants.
---

# Documentation Coherence

## Core Principle

**Always verify and maintain coherence between all project documents.**

Documentation is a critical project asset. Any inconsistency between different documents can create confusion and development errors.

## Documents to Keep Coherent

### 1. Project Brief

**File**: `docs/README.md`

**Contents**:

- Project overview
- Main features
- List of documented use cases
- Technical architecture
- Current project state

**Responsibility**: Main reference document, source of truth for the global vision.

### 2. Use Case Index

**File**: `docs/use-cases/README.md`

**Contents**:

- Complete index of all use cases
- Organized by feature
- Links to each documentation

**Responsibility**: Must list ALL documented use cases.

### 3. Individual Use Cases

**Folders**: `docs/use-cases/<feature>/`

**Contents**:

- Detailed documentation of each use case
- Actors, scenarios, business rules
- Exceptions and constraints

**Responsibility**: Must be aligned with the brief and implementation.

### 4. Application READMEs

**Files**: `apps/*/README.md`

**Contents**:

- Application description
- Implemented features
- Specific architecture

**Responsibility**: Must reflect the actual state of the application.

## Coherence Rules

### RC-001: Use Case Synchronization

**Rule**: Every use case mentioned in the brief must:

1. Have a documentation file in `docs/use-cases/<feature>/`
2. Be listed in the index `docs/use-cases/README.md`
3. Correspond to an implementation in `apps/store/src/domain/usecases/`

**Verification**:

```bash
# Compare use case files with the index
ls docs/use-cases/*/
cat docs/use-cases/README.md
cat docs/README.md
```

### RC-002: Actor Coherence

**Rule**: Actors defined in each use case must be consistent with:

- The "Actors" section of the brief (`docs/README.md`)
- The features described for each actor
- The nominal scenario of the use case

**Project actors**:

- **Licensees**: Place individual orders
- **Administrators**: Manage global orders

**Verification**:

- If the use case concerns a licensee action → Main actor = Licensee
- If the use case concerns global management → Main actor = Administrator

### RC-003: Feature Alignment

**Rule**: Features listed in the brief must have:

- One or more documented use cases
- OR an explicit justification if it is pure UI logic

**Licensee Features** (brief):

- ✅ Profile selection → UI logic (no use case needed)
- ✅ Catalog browsing → Use case `get-all-products`
- ✅ Basket management → Local UI logic (TanStack Store)
- ✅ Order placement → Use case `create-licensee-order`
- ✅ History → Use case `get-licensee-order-history`

**Administrator Features** (brief):

- ✅ Global order creation → Use case `create-order`
- ✅ Status management → Use case `update-order-status`
- ✅ Browsing → Use case `get-current-order`

### RC-004: Index Synchronization

**Rule**: The index `docs/use-cases/README.md` must:

1. List ALL `.md` files present in `docs/use-cases/*/`
2. Be organized by feature (Order, Licensee, Product)
3. Use the same titles as in the use case files

**Automatic verification**:

```bash
# List all documented use cases
find docs/use-cases -name "*.md" -not -name "README.md" -not -name "template.md"

# Compare with the index
grep -E "^\- \[" docs/use-cases/README.md
```

### RC-005: Brief ↔ Use Cases Coherence

**Rule**: The "Documented Use Cases" section of the brief (`docs/README.md`) must:

1. List exactly the same use cases as the index
2. Use the same titles
3. Be organized the same way (by feature)

**Verification**:

- Compare `docs/README.md` (Documented Use Cases section)
- With `docs/use-cases/README.md` (Use Cases Index section)

### RC-006: Documentation Versioning

**Rule**: When making significant changes:

1. Update the "History" section of the modified use case
2. Update the "Last updated" date in the brief
3. Increment the version if major change

**History Format**:

```markdown
| Date       | Version | Author | Changes     |
| ---------- | ------- | ------ | ----------- |
| YYYY-MM-DD | X.Y     | Name   | Description |
```

## Verification Workflow

### Before Each Commit

1. **Verify use cases**:
   - Are all files in the index?
   - Do all use cases in the index exist?

2. **Verify actors**:
   - Consistent with the brief?
   - Consistent with the nominal scenario?

3. **Verify the brief**:
   - Use case list up to date?
   - Features aligned?

### When Adding a Use Case

1. Create the file `docs/use-cases/<feature>/<use-case>.md`
2. Add to the index `docs/use-cases/README.md`
3. Add to the brief `docs/README.md` (Documented Use Cases section)
4. Verify actor coherence

### When Modifying a Use Case

1. Update the documentation file
2. Add an entry in the history
3. Check if the brief needs updating
4. Verify coherence with the implementation

### When Removing a Use Case

1. Delete the documentation file
2. Remove from the index `docs/use-cases/README.md`
3. Remove from the brief `docs/README.md`
4. Delete the corresponding implementation

## Coherence Checklist

Before validating a documentation change:

- [ ] All use cases in the brief are in the index
- [ ] All use cases in the index have a documentation file
- [ ] All documentation files are in the index
- [ ] Actors are consistent across all use cases
- [ ] Brief features have corresponding use cases
- [ ] Titles are identical between brief, index and files
- [ ] Feature organization is consistent everywhere
- [ ] Update dates are current

## Verification Tools

### Verification Script (Future)

```bash
#!/bin/bash
# verify-docs-coherence.sh

echo "Verifying documentation coherence..."

# 1. List documented use cases
documented=$(find docs/use-cases -name "*.md" -not -name "README.md" -not -name "template.md" | wc -l)

# 2. Count entries in the index
indexed=$(grep -c "^\- \[" docs/use-cases/README.md)

# 3. Compare
if [ "$documented" -eq "$indexed" ]; then
  echo "✅ Index coherent: $documented use cases"
else
  echo "❌ Incoherence: $documented files, $indexed in the index"
  exit 1
fi
```

## Examples of Inconsistencies to Avoid

### ❌ Use Case in Brief but Not Documented

```markdown
<!-- docs/README.md -->

### Order

1. Create a global order
2. Delete an order ← No corresponding file!
```

### ❌ Use Case Documented but Not in Index

```
docs/use-cases/order/cancel-order.md exists
But absent from docs/use-cases/README.md
```

### ❌ Inconsistent Actor

```markdown
<!-- Use case: create-licensee-order.md -->

Main actor: Administrator ← ERROR!
Scenario: The licensee adds items... ← Inconsistency!
```

### ❌ Different Titles

```markdown
<!-- docs/README.md -->

1. Create a global order

<!-- docs/use-cases/README.md -->

- [Create an order](order/create-order.md) ← Different title!
```

## Responsibilities

### Developer

- Verify coherence before each commit
- Update documentation when making business changes
- Report detected inconsistencies

### Cascade (AI Assistant)

- **ALWAYS** verify coherence when modifying documentation
- Propose corrections if inconsistencies are detected
- Maintain alignment between brief, index and use cases
- Verify actors in use cases

### Reviewer

- Validate coherence during code reviews
- Verify that documentation is up to date
- Ensure use cases reflect the implementation

## Maintenance

This rule must be applied:

- ✅ When creating use cases
- ✅ When modifying use cases
- ✅ When removing use cases
- ✅ When updating the brief
- ✅ When adding features
- ✅ Before each commit touching `docs/`

## References

- [Use Case Template](../../docs/use-cases/template.md)
- [Project Brief](../../docs/README.md)
- [Use Case Index](../../docs/use-cases/README.md)
- [Domain-Driven Design](./domain-driven-design.md)

---

**Version**: 1.0  
**Last updated**: March 26, 2026  
**Status**: Always On - Rule always active
