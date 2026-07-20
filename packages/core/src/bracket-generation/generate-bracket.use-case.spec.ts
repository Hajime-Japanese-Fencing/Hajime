import { describe, it, expect } from "vite-plus/test";
import { generateBracketUseCase } from "./generate-bracket.use-case.ts";
import { FakeSaveBracketAdapter } from "./__test__/fake-save-bracket.adapter.ts";
import { makeCompetitionId } from "../shared/competition-id.ts";
import type { PoolFighterEntry } from "../services/fighter.interface.ts";

function makeFighters(count: number): PoolFighterEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `fighter-${i + 1}`,
    isSeriesHead: false,
    club: "club A",
  }));
}

describe("Generate Bracket Use Case", () => {
  it("should generate a bracket and persist it via the port", async () => {
    const saveBracket = new FakeSaveBracketAdapter();
    const competitionId = makeCompetitionId("competition-1");

    const bracket = await generateBracketUseCase({ saveBracket }, competitionId, makeFighters(8));

    expect(bracket.size).toBe(8);
    expect(saveBracket.callCount).toBe(1);
    expect(saveBracket.getBracket(competitionId)).toStrictEqual(bracket);
  });

  it("should not save anything when bracket generation fails", async () => {
    const saveBracket = new FakeSaveBracketAdapter();
    const competitionId = makeCompetitionId("competition-1");

    await expect(
      generateBracketUseCase({ saveBracket }, competitionId, makeFighters(1)),
    ).rejects.toThrow("cannot create a bracket for less than 2 fighters");

    expect(saveBracket.callCount).toBe(0);
    expect(saveBracket.getBracket(competitionId)).toBeUndefined();
  });

  it("should persist brackets independently per competition", async () => {
    const saveBracket = new FakeSaveBracketAdapter();
    const competitionA = makeCompetitionId("competition-a");
    const competitionB = makeCompetitionId("competition-b");

    const bracketA = await generateBracketUseCase({ saveBracket }, competitionA, makeFighters(4));
    const bracketB = await generateBracketUseCase({ saveBracket }, competitionB, makeFighters(8));

    expect(saveBracket.getBracket(competitionA)).toStrictEqual(bracketA);
    expect(saveBracket.getBracket(competitionB)).toStrictEqual(bracketB);
    expect(saveBracket.callCount).toBe(2);
  });
});
