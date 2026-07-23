import { describe, it, expect } from "vite-plus/test";
import { generateBracket } from "./generate-bracket.service.ts";
import type { FighterEntry } from "../../../../shared/fighter.ts";

function makeFighters(count: number, seriesHeadCount = 0): FighterEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `fighter-${i + 1}`,
    isSeriesHead: i < seriesHeadCount,
    club: "club A",
  }));
}

function allFightersInBracket(fighters: FighterEntry[]) {
  const bracket = generateBracket(fighters);

  const fightersInFirstRound = bracket.rounds[0].matches.flatMap((match) =>
    [match.fighter1, match.fighter2].filter((f): f is FighterEntry => f !== null),
  );

  return { bracket, fightersInFirstRound };
}

describe("Bracket Generation - Direct elimination", () => {
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

  it("should prioritize series heads when distributing byes", () => {
    const fighters = makeFighters(11, 5); // 5 series heads, exactly the number of byes needed

    const { bracket } = allFightersInBracket(fighters);

    const byeFighterIds = bracket.rounds[0].matches
      .filter((match) => match.fighter2 === null)
      .map((match) => match.fighter1!.id);

    const seriesHeadIds = fighters.filter((f) => f.isSeriesHead).map((f) => f.id);

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

  it("should throw an error when there are fewer than 2 fighters", () => {
    expect(() => generateBracket(makeFighters(1))).toThrow(
      "cannot create a bracket for less than 2 fighters",
    );
  });

  it("should throw an error for an empty fighters list", () => {
    expect(() => generateBracket([])).toThrow("cannot create a bracket for less than 2 fighters");
  });
});
