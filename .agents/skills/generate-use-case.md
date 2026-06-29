---
name: generate-use-case
description: Génère un document de spécification de use case et le sauvegarde dans docs/use-cases/. Utilise quand l'utilisateur demande de créer ou documenter un nouveau use case.
---

# Generate Use Case Document

## Purpose

Generate a use case specification document and save it to `docs/use-cases/`.

## Format

Use the **mix format**: a one-line user story for business context, a numbered main flow, alternate flows, and isolated business rules.

### File naming

`docs/use-cases/UC-<NN>-<kebab-case-name>.md`

Example: `docs/use-cases/UC-01-create-competition.md`

### Template

```markdown
## UC-NN: <Use Case Name>

**As a** <Actor>, **I want to** <goal> **so that** <business value>.

**Preconditions**: <what must be true before> / None  
**Postconditions**: <what is true after>

### Main Flow
1. <step>
2. <step>
3. ...

### Alternate Flows
- **<condition>** → `<ErrorName>` / <what happens>

### Business Rules
- BR1: <rule>
- BR2: <rule>
```

---

## Examples

### Example 1 — Create Competition

```markdown
## UC-01: Create Competition

**As an** Organiser, **I want to** create a competition **so that** I can manage its fighters and fights.

**Preconditions**: None  
**Postconditions**: Competition is saved with status `Creation`

### Main Flow
1. Organiser provides name*, date*, location, type (Individual/Team), format (Pools/Bracket/Both)
2. If Team mode: organiser provides fighters per team (default: 5)
3. System validates required fields
4. System creates the competition with status `Creation`

### Alternate Flows
- **Missing required field** → `MissingFieldError`
- **Date is in the past** → `InvalidDateError`

### Business Rules
- BR1: Name and date are mandatory
- BR2: Team mode requires fighters-per-team > 0
- BR3: Competition starts in status `Creation`, never directly `In Progress`
```

---

### Example 2 — Record Fight Result

```markdown
## UC-02: Record Fight Result

**As a** Referee, **I want to** record the result of a fight **so that** the competition standings are updated.

**Preconditions**: Fight is in status `In Progress`  
**Postconditions**: Fight is in status `Finished`, result is saved

### Main Flow
1. Referee selects the winning fighter (White or Red)
2. Referee provides ippons scored (Men, Kote, Do, Tsuki) and penalties (Hansoku)
3. Referee confirms the result
4. System saves the result and transitions fight to status `Finished`
5. System updates pool or bracket standings

### Alternate Flows
- **Tie with no Hantei** → Referee must enable Enshō (sudden death) before confirming
- **Fighter forfeits** → Referee selects forfeit action; result recorded without fight data
- **Fight not in progress** → `FightNotInProgressError`

### Business Rules
- BR1: Only one fight can be `In Progress` at a time within a competition
- BR2: A finished fight is read-only — no modifications allowed
- BR3: Hansoku counts as a point for the opposing fighter
- BR4: Hantei can only be used when scores are equal at the end of regulation time
```
