import { describe, it, expect } from "vite-plus/test";
import { generateBracket } from "./generate-bracket.service.ts";
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

  it("should throw an error when there are fewer than 2 fighters", () => {
    expect(() => generateBracket(makeFighters(1))).toThrow(
      "cannot create a bracket for less than 2 fighters",
    );
  });

  it("should throw an error for an empty fighters list", () => {
    expect(() => generateBracket([])).toThrow("cannot create a bracket for less than 2 fighters");
  });
});
