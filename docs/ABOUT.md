# Kendo in Competition — Business Rules

## The Fighters

A fighter is the individual who participates in the competition. They are uniquely identified
by their license number, associated with their name and the competition they belong to.
They also have a date of birth, a grade (expressed in Dan), and a home club.

A fighter may be designated as a seed. This designation is taken into account during the draw
to prevent the best fighters from facing each other too early in the competition.

---

## Competition Types

### Individual

Each fighter competes on a personal basis and is ranked under their own name.
The results they achieve belong directly to them.

### Team

Fighters are grouped into teams. A team is composed of 5 starting fighters,
to which substitutes may be added. The competition pits teams against each other:
during a match, each starting fighter from one team faces a starting fighter from
the opposing team in an individual duel. The order in which fighters face each other
within a match is defined by each team before the match begins and may serve as a
strategic element.

---

## Competition Formats

### Pools — Round-Robin Format

A pool is a group of fighters who all face each other. Each fighter therefore meets
every other fighter in their pool once. For a pool of N fighters, this generates
N×(N-1)/2 fights.

At the end of all fights in a pool, fighters are ranked according to three criteria
applied in order of priority: number of victories first, then in case of a tie the
number of ippons scored, and finally the number of ippons received.
The highest-ranked fighters in their pool qualify for the next stage of the competition,
according to a number of qualifiers per pool defined in advance by the organiser.

### Elimination Bracket — Single-Elimination Format

The elimination bracket is a direct-elimination draw. A fighter who loses a fight is
immediately eliminated and plays no further fights. The size of the bracket is always
a multiple of 4 (4, 8, 16, 32...).

The placement of fighters in the bracket is not random: seeds are positioned so that
they only meet each other at the most advanced stages. Seed #1 and seed #2 are placed
in opposite halves, ensuring they can only meet in the final. Seeds #3 and #4 are
distributed across the two other quarters so that they can only face #1 or #2 in the
semi-finals. This principle applies recursively at each level of the bracket.

When the number of qualified fighters does not exactly match the bracket size, some
positions remain empty. A fighter facing an empty position automatically qualifies for
the next round without having to fight. This is called a bye.

It is possible to organise a third-place match between the two fighters eliminated in
the semi-finals.

### Pools + Elimination Bracket

This format combines the two previous ones. A pool phase is first completed in its
entirety. The fighters who qualify from the pools then enter an elimination bracket
whose progression follows the rules described above.

---

## A Fight

### The Objective

A fight opposes two fighters: one designated as White, the other as Red.
The winner is the first to score 2 ippons. If the regulation time expires before this,
several cases apply.

If only one fighter has scored 1 ippon, they are declared the winner.

If both fighters are tied — whether at 1-1 or 0-0 — the fight is a Hikiwake (draw).
A sudden-death overtime is then played: the Encho. The first fighter to score an ippon,
regardless of the technique, immediately wins the fight.

If the tie persists after the Encho, the winner is decided either by a collective
referee decision — the Hantei — or by a coin toss — the Chusen.

### Techniques Worth an Ippon

An ippon is awarded when a fighter delivers a technically valid strike to a specific
target area on their opponent. There are four recognised techniques:

**Men** _(noted M)_ is a strike delivered to the opponent's head.

**Kote** _(noted K)_ is a strike delivered to the opponent's wrists.

**Do** _(noted D)_ is a strike delivered to the opponent's side or torso.

**Tsuki** _(noted T)_ is a thrust delivered to the opponent's throat.

### Hansoku _(noted △)_ — The Penalty

When a fighter commits a rule infraction, they receive a Hansoku. This penalty
immediately awards one ippon to their opponent. If the same fighter accumulates
two Hansoku during the same fight, the opponent receives an Ippon _(noted I)_,
regardless of the score at that moment.

### Hantei — The Referee Decision

If the regulation time of a fight expires without a winner being determined — that is,
when both fighters are tied — the referees collectively decide which fighter dominated
the exchange. This decision is called the Hantei. It is final and cannot be changed.

Hantei _(noted H)_ results in a point being awarded to the fighter.

### Enshō — Sudden Death

As an alternative to or before the Hantei, a sudden-death overtime may be played.
In this case, the first fighter to score an ippon, regardless of the technique,
immediately wins the fight. The Enshō ends as soon as an ippon is awarded.

### Forfeit

A fighter may be declared a forfeit before or during a fight. In this case, they are
declared the loser without the fight being contested, and their opponent is declared
the winner by default.
