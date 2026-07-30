import { describe, it, expect } from "vite-plus/test";
import { generateBracket, advanceWinner } from "./generate-bracket.service.ts";
import type { FighterEntry } from "../../../../shared/fighter.ts";

function makeFighters(count: number, seriesHeadCount = 0): FighterEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `fighter-${i + 1}`,
    isSeeded: i < seriesHeadCount,
    club: "club A",
  }));
}

function allFightersInBracket(fighters: FighterEntry[]) {
  const bracket = generateBracket(fighters, true);

  const fightersInFirstRound = bracket.rounds[0].matches.flatMap((match) =>
    [match.fighter1, match.fighter2].filter((f): f is FighterEntry => f !== null),
  );

  return { bracket, fightersInFirstRound };
}

describe("Building a direct-elimination bracket", () => {
  it("should create a bracket without byes for a power-of-two number of fighters", () => {
    const fighters = makeFighters(8);

    const { bracket, fightersInFirstRound } = allFightersInBracket(fighters);

    expect(bracket.size).toBe(8);
    expect(bracket.rounds[0].matches).toHaveLength(4);
    expect(bracket.rounds[0].matches.every((match) => match.fighter1 && match.fighter2)).toBe(true);
    expect(fightersInFirstRound).toHaveLength(8);
  });

  it("should include every input fighter exactly once in the first round", () => {
    const fighters = makeFighters(11);

    const { fightersInFirstRound } = allFightersInBracket(fighters);

    expect(fightersInFirstRound).toHaveLength(11);
    expect(new Set(fightersInFirstRound.map((f) => f.id)).size).toBe(11);
  });

  it("should round the bracket size up to the next power of two", () => {
    const fighters = makeFighters(11);

    const { bracket } = allFightersInBracket(fighters);

    expect(bracket.size).toBe(16);
    expect(bracket.rounds[0].matches).toHaveLength(8);
  });

  it("should give byes to fighters, resulting in fighter2 being null", () => {
    const fighters = makeFighters(11);

    const { bracket } = allFightersInBracket(fighters);

    const byeMatches = bracket.rounds[0].matches.filter((match) => match.fighter2 === null);

    expect(byeMatches).toHaveLength(5); // 16 - 11
    expect(byeMatches.every((match) => match.fighter1 !== null)).toBe(true);
  });

  it("should give byes to seeded competitors first", () => {
    const fighters = makeFighters(11, 5); // 5 series heads, exactly the number of byes needed

    const { bracket } = allFightersInBracket(fighters);

    const byeFighterIds = bracket.rounds[0].matches
      .filter((match) => match.fighter2 === null)
      .map((match) => match.fighter1!.id);

    const seriesHeadIds = fighters.filter((f) => f.isSeeded).map((f) => f.id);

    expect(byeFighterIds.sort((a, b) => a.localeCompare(b))).toEqual(
      seriesHeadIds.sort((a, b) => a.localeCompare(b)),
    );
  });

  it("should build empty placeholder rounds down to a single final match", () => {
    const fighters = makeFighters(8);

    const { bracket } = allFightersInBracket(fighters);

    expect(bracket.rounds.map((round) => round.matches.length)).toEqual([4, 2, 1]);
    expect(
      bracket.rounds
        .slice(1)
        .every((round) => round.matches.every((m) => m.fighter1 === null && m.fighter2 === null)),
    ).toBe(true);
  });

  it("should place the top two series heads in opposite halves of the bracket, so they cannot meet before the final", () => {
    const fighters = makeFighters(8, 2);

    const { bracket } = allFightersInBracket(fighters);

    const slotOrder = bracket.rounds[0].matches.flatMap((match) => [
      match.fighter1,
      match.fighter2,
    ]);
    const firstSeedIndex = slotOrder.findIndex((fighter) => fighter?.id === "fighter-1");
    const secondSeedIndex = slotOrder.findIndex((fighter) => fighter?.id === "fighter-2");

    const half = bracket.size / 2;
    expect(firstSeedIndex < half).not.toBe(secondSeedIndex < half);
  });

  it("should never pair two series heads against each other in the first round when there are enough slots", () => {
    const fighters = makeFighters(16, 4);

    const { bracket } = allFightersInBracket(fighters);

    const seededIds = new Set(fighters.filter((f) => f.isSeeded).map((f) => f.id));
    const matchesWithTwoSeeds = bracket.rounds[0].matches.filter(
      (match) => seededIds.has(match.fighter1?.id ?? "") && seededIds.has(match.fighter2?.id ?? ""),
    );

    expect(matchesWithTwoSeeds).toHaveLength(0);
  });

  it("should never pair two byes against each other", () => {
    const fighters = makeFighters(9, 3);

    const { bracket } = allFightersInBracket(fighters);

    const matchesWithNoFighters = bracket.rounds[0].matches.filter(
      (match) => match.fighter1 === null && match.fighter2 === null,
    );

    expect(matchesWithNoFighters).toHaveLength(0);
    expect(bracket.rounds[0].matches.every((match) => match.fighter1 !== null)).toBe(true);
  });

  it("should not pair two fighters from the same club in the first round", () => {
    const fighters: FighterEntry[] = [
      { id: "fighter-1", isSeeded: false, club: "club A" },
      { id: "fighter-2", isSeeded: false, club: "club A" },
      { id: "fighter-3", isSeeded: false, club: "club B" },
      { id: "fighter-4", isSeeded: false, club: "club B" },
    ];

    const { bracket } = allFightersInBracket(fighters);

    const matchesWithSameClub = bracket.rounds[0].matches.filter(
      (match) => match.fighter1 && match.fighter2 && match.fighter1.club === match.fighter2.club,
    );

    expect(matchesWithSameClub).toHaveLength(0);
  });

  // Est-ce un comportement que l'on souhaite conserver ou bien corriger ?
  it(
    "should allow a series head to face a fighter from their own club in the first round " +
      "(known limitation, accepted: club separation only applies between two non-seeded " +
      "fighters, since seed placement takes priority)",
    () => {
      // 8 fighters, no byes: 1 series head (club A) + 7 others (4 club A, 3 club B).
      // The 3 "other vs other" matchups always consume exactly 1 club A and 1 club B fighter
      // each (there are exactly enough of both), so the single leftover fighter placed against
      // the series head is deterministically from club A too, regardless of the shuffle.
      const fighters: FighterEntry[] = [
        { id: "series-head", isSeeded: true, club: "club A" },
        { id: "other-a-1", isSeeded: false, club: "club A" },
        { id: "other-a-2", isSeeded: false, club: "club A" },
        { id: "other-a-3", isSeeded: false, club: "club A" },
        { id: "other-a-4", isSeeded: false, club: "club A" },
        { id: "other-b-1", isSeeded: false, club: "club B" },
        { id: "other-b-2", isSeeded: false, club: "club B" },
        { id: "other-b-3", isSeeded: false, club: "club B" },
      ];

      const { bracket } = allFightersInBracket(fighters);

      const seriesHeadMatch = bracket.rounds[0].matches.find(
        (match) => match.fighter1?.id === "series-head" || match.fighter2?.id === "series-head",
      )!;
      const opponent =
        seriesHeadMatch.fighter1?.id === "series-head"
          ? seriesHeadMatch.fighter2
          : seriesHeadMatch.fighter1;

      expect(opponent?.club).toBe("club A");
    },
  );

  it("should throw an error when there are fewer than 2 fighters", () => {
    expect(() => generateBracket(makeFighters(1))).toThrow(
      "cannot create a bracket for less than 2 fighters",
    );
  });

  it("should throw an error for an empty fighters list", () => {
    expect(() => generateBracket([])).toThrow("cannot create a bracket for less than 2 fighters");
  });
});

describe("Advancing a winner to the next round", () => {
  it("should place the first match's winner in fighter1 of the next round's first match", () => {
    const fighters = makeFighters(4);
    const bracket = generateBracket(fighters);

    const firstMatch = bracket.rounds[0].matches[0];
    const winner = firstMatch.fighter1!;

    const updatedBracket = advanceWinner(bracket, 1, 0, winner);

    expect(updatedBracket.rounds[1].matches[0].fighter1).toEqual(winner);
    expect(updatedBracket.rounds[1].matches[0].fighter2).toBeNull();
  });

  it("should place the second match's winner in fighter2 of the next round's first match", () => {
    const fighters = makeFighters(4);
    const bracket = generateBracket(fighters);

    const secondMatch = bracket.rounds[0].matches[1];
    const winner = secondMatch.fighter1!;

    const updatedBracket = advanceWinner(bracket, 1, 1, winner);

    expect(updatedBracket.rounds[1].matches[0].fighter2).toEqual(winner);
    expect(updatedBracket.rounds[1].matches[0].fighter1).toBeNull();
  });

  it("should throw an error when the given winner did not fight in that match", () => {
    const fighters = makeFighters(4);
    const bracket = generateBracket(fighters);

    const impostor: FighterEntry = { id: "not-in-this-bracket", isSeeded: false, club: "club A" };

    expect(() => advanceWinner(bracket, 1, 0, impostor)).toThrow();
  });

  it(
    "should accept a winner that is a distinct object with the same id as the fighter " +
      "who actually fought (e.g. reloaded from storage), not just the exact same reference",
    () => {
      const fighters = makeFighters(4);
      const bracket = generateBracket(fighters);

      const actualFighter = bracket.rounds[0].matches[0].fighter1!;
      // --- SAME DATA, DIFFERENT OBJECT REFERENCE (SIMULATES A ROUND-TRIP THROUGH STORAGE) ---
      const reloadedWinner: FighterEntry = { ...actualFighter };

      expect(() => advanceWinner(bracket, 1, 0, reloadedWinner)).not.toThrow();
    },
  );

  it("should throw an error when the given round does not exist", () => {
    const fighters = makeFighters(4);
    const bracket = generateBracket(fighters);

    const winner = bracket.rounds[0].matches[0].fighter1!;

    expect(() => advanceWinner(bracket, 42, 0, winner)).toThrow();
  });

  it("should throw a clear error when matchIndex is out of bounds for the round", () => {
    const fighters = makeFighters(4);
    const bracket = generateBracket(fighters);

    const winner = bracket.rounds[0].matches[0].fighter1!;

    // --- ROUND 1 ONLY HAS 2 MATCHES (INDICES 0 AND 1): 5 IS OUT OF BOUNDS ---
    expect(() => advanceWinner(bracket, 1, 5, winner)).toThrow("No such match");
  });

  it("should throw a clear error when matchIndex is negative", () => {
    const fighters = makeFighters(4);
    const bracket = generateBracket(fighters);

    const winner = bracket.rounds[0].matches[0].fighter1!;

    expect(() => advanceWinner(bracket, 1, -1, winner)).toThrow("No such match");
  });

  it("should not mutate the given bracket, returning a new one instead", () => {
    const fighters = makeFighters(4);
    const bracket = generateBracket(fighters);

    const winner = bracket.rounds[0].matches[0].fighter1!;
    const originalNextRoundMatch = bracket.rounds[1].matches[0];

    const updatedBracket = advanceWinner(bracket, 1, 0, winner);

    expect(updatedBracket).not.toBe(bracket);
    expect(updatedBracket.rounds).not.toBe(bracket.rounds);
    expect(bracket.rounds[1].matches[0]).toBe(originalNextRoundMatch);
    expect(bracket.rounds[1].matches[0].fighter1).toBeNull();
    expect(bracket.rounds[1].matches[0].fighter2).toBeNull();
  });

  it("should keep both winners when advancing two matches that feed the same next match", () => {
    const fighters = makeFighters(4);
    const bracket = generateBracket(fighters);

    const winnerOfMatch0 = bracket.rounds[0].matches[0].fighter1!;
    const winnerOfMatch1 = bracket.rounds[0].matches[1].fighter1!;

    // --- THE SECOND CALL MUST BUILD ON TOP OF THE FIRST CALL'S RESULT, NOT ON THE
    // ORIGINAL BRACKET, SINCE advanceWinner IS PURE AND RETURNS A NEW BRACKET EACH TIME. ---
    const bracketAfterFirstWinner = advanceWinner(bracket, 1, 0, winnerOfMatch0);
    const bracketAfterBothWinners = advanceWinner(bracketAfterFirstWinner, 1, 1, winnerOfMatch1);

    const nextMatch = bracketAfterBothWinners.rounds[1].matches[0];

    expect(nextMatch.fighter1?.id).toBe(winnerOfMatch0.id);
    expect(nextMatch.fighter2?.id).toBe(winnerOfMatch1.id);
  });

  it("should propagate a winner all the way to the final across several rounds", () => {
    const fighters = makeFighters(8);
    const bracket = generateBracket(fighters);

    // --- ROUND 1 (4 MATCHES) -> ROUND 2 (2 MATCHES) -> ROUND 3, THE FINAL (1 MATCH) ---
    const winnerOfMatch0 = bracket.rounds[0].matches[0].fighter1!;
    const winnerOfMatch1 = bracket.rounds[0].matches[1].fighter1!;

    const afterRound1Match0 = advanceWinner(bracket, 1, 0, winnerOfMatch0);
    const afterRound1Match1 = advanceWinner(afterRound1Match0, 1, 1, winnerOfMatch1);

    // --- ROUND 2's FIRST MATCH NOW OPPOSES winnerOfMatch0 (fighter1) AND winnerOfMatch1
    // (fighter2): winnerOfMatch0 GOES ON TO WIN THAT MATCH TOO. ---
    const afterRound2Match0 = advanceWinner(afterRound1Match1, 2, 0, winnerOfMatch0);

    const finalMatch = afterRound2Match0.rounds[2].matches[0];

    expect(finalMatch.fighter1?.id).toBe(winnerOfMatch0.id);
    expect(finalMatch.fighter2).toBeNull();
  });
});
