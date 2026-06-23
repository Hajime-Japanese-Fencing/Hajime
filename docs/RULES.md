# Hajime — Functional Document

## Ubiquitous Language

| Term                | Definition                                                    |
| ------------------- | ------------------------------------------------------------- |
| Fighter             | Competitor participating in the competition                   |
| Ippon               | Point scored during a fight                                   |
| Pool                | Group of fighters competing against each other in round-robin |
| Elimination bracket | Direct-elimination draw (single bracket)                      |
| Seed                | Fighter designated as a favourite during the draw             |
| Hansoku             | Penalty given to a fighter during a fight                     |
| Hantei              | Referee decision in case of a tie                             |
| Enshō               | Sudden-death overtime                                         |
| Call list           | Attendance list — management of fighter presence              |
| Match               | In team mode: encounter between two teams                     |
| Fight               | Individual duel between two fighters                          |

---

## Competition Lifecycle

Creation → Pre-competition → Competition → Finished

### Phase 1 — Creation

- Input: name*, date*, location, organiser
- Type selection: Individual or Team
  - If Team: number of fighters per team (default: 5, excluding substitutes)
- Format selection: Pools / Elimination bracket / Pools + Bracket
- Import fighters (CSV or manual entry)
  - Fields: Name*, Date of birth*, License number\*, Grade, Club
  - In Team mode: additional Team\* field

### Phase 2 — Pre-competition

**Step 1 — Call list** → status: Awaiting validation

- Mark each fighter Present or Absent
- In Team mode: presence checked fighter by fighter within each team
- Any position without a fighter blocks progression (status: VALIDATION NEEDED)

**Step 2 — Draw** → status: Awaiting draw

- Accessible only after full call list validation
- Pool or bracket configuration
- Optional draw constraints:
  - Separate fighters from the same club
  - Separate seeds
- Random draw available

### Phase 3 — Competition → status: In Progress

- Input of fight results (see Fight section)

### Phase 4 — Finished → status: Finished

- All data becomes read-only
- No modifications possible

---

## Pool Management

- Configuration: number of pools and size based on the number of participants
- Number of fighters qualifying per pool: configurable
- Export pool sheets as PDF

---

## Elimination Bracket Management

- Size: multiple of 4
- Seed placement: automatic according to seeding logic
- Empty positions (byes): automatic qualification to the next round
- Option: third-place match (can be enabled)
- Export bracket as PDF

---

## Fight Management

### Fight States

> TODO → In Progress → Finished

| State       | Rule                                                 |
| ----------- | ---------------------------------------------------- |
| TODO        | Fight pending, can be started                        |
| In Progress | Only one active fight at a time — others are blocked |
| Finished    | Read-only — no modifications possible                |

### Fight Input

- Interface: White fighter (left) vs Red fighter (right)
- Input ippons by technique: Men, Kote, Do, Tsuki
- Input penalties: Hansoku (△)
- Input referee decision: Hantei (Ht)
- Enshō (sudden death) option: can be enabled per fight
- Forfeit action: loss recorded without a fight
- Explicit result validation required

### Team Mode — Specifics

- The order in which fighters compete in a match can be changed before it starts
- A position without a fighter → status: VALIDATION NEEDED → blocks match validation
- Match validation requires all individual duels to be resolved
