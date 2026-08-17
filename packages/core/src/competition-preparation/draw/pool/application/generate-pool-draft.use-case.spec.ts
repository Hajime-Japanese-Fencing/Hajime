import { describe, it, expect } from "vite-plus/test";
import { generatePoolDraftUseCase } from "./generate-pool-draft.use-case.ts";
import { SpySavePoolDraftAdapter } from "../__test__/spy-save-pool-draft.adapter.ts";
import { poolFighterEntryFactory } from "../__test__/factories.ts";
import { makeCompetitionId } from "../../../../shared/competition-id.ts";
import type { PoolSetup } from "../domain/setup/pool-setup.ts";
import type { FighterEntry } from "../../../../shared/fighter.ts";

function makeFighters(count: number): FighterEntry[] {
  return Array.from({ length: count }, (_, i) =>
    poolFighterEntryFactory({ id: `fighter-${i + 1}` }),
  );
}

const TWO_POOLS_OF_THREE: PoolSetup = {
  fightCount: 6,
  poolGroups: [{ poolSize: 3, amount: 2 }],
};

const TWO_POOLS_OF_FOUR: PoolSetup = {
  fightCount: 12,
  poolGroups: [{ poolSize: 4, amount: 2 }],
};

describe("Generating a pool draft", () => {
  it("should distribute fighters into pools and persist the draft via the port", async () => {
    const savePoolDraft = new SpySavePoolDraftAdapter();
    const competitionId = makeCompetitionId("competition-1");

    const pools = await generatePoolDraftUseCase(
      { savePoolDraft },
      competitionId,
      makeFighters(6),
      TWO_POOLS_OF_THREE,
    );

    expect(pools.length).toBe(2);
    expect(savePoolDraft.callCount).toBe(1);
    expect(savePoolDraft.getPools(competitionId)).toStrictEqual(pools);
  });

  it("should not save anything when the fighter count doesn't fit the pool setup capacity", async () => {
    const savePoolDraft = new SpySavePoolDraftAdapter();
    const competitionId = makeCompetitionId("competition-1");

    await expect(
      generatePoolDraftUseCase(
        { savePoolDraft },
        competitionId,
        makeFighters(6),
        TWO_POOLS_OF_FOUR,
      ),
    ).rejects.toThrow("Fighter amount doesn't fit pool setup capacity");

    expect(savePoolDraft.callCount).toBe(0);
    expect(savePoolDraft.getPools(competitionId)).toBeUndefined();
  });

  it("should persist pool drafts independently per competition", async () => {
    const savePoolDraft = new SpySavePoolDraftAdapter();
    const competitionA = makeCompetitionId("competition-a");
    const competitionB = makeCompetitionId("competition-b");

    const poolsA = await generatePoolDraftUseCase(
      { savePoolDraft },
      competitionA,
      makeFighters(6),
      TWO_POOLS_OF_THREE,
    );
    const poolsB = await generatePoolDraftUseCase(
      { savePoolDraft },
      competitionB,
      makeFighters(8),
      TWO_POOLS_OF_FOUR,
    );

    expect(savePoolDraft.getPools(competitionA)).toStrictEqual(poolsA);
    expect(savePoolDraft.getPools(competitionB)).toStrictEqual(poolsB);
    expect(savePoolDraft.callCount).toBe(2);
  });
});
