import type { FighterEntry } from "../../../../shared/fighter.ts";
import type { CompetitionId } from "../../../../shared/competition-id.ts";
import type { SavePoolDraftPort } from "../ports/save-pool-draft.port.ts";
import type { Pool } from "../domain/pool.ts";
import type { PoolSetup } from "../domain/setup/pool-setup.ts";
import { distributeFightersInPools } from "../domain/distribution/pool-distribution.service.ts";

export interface GeneratePoolDraftUseCaseDeps {
  savePoolDraft: SavePoolDraftPort;
}

/**
 * Generates a pool draft for a competition and persists it.
 * Orchestration only
 */
/* TODO  inclure organizePoolFights pour gerer l'ordre des combats ? */
export async function generatePoolDraftUseCase(
  deps: GeneratePoolDraftUseCaseDeps,
  competitionId: CompetitionId,
  fighters: FighterEntry[],
  poolSetup: PoolSetup,
  randomize: (element: FighterEntry[]) => FighterEntry[],
  shouldSeparateClubMembers = false,
  shouldSeparateSeededCompetitors = false,
): Promise<Pool[]> {
  const pools = distributeFightersInPools(
    fighters,
    poolSetup,
    randomize,
    shouldSeparateClubMembers,
    shouldSeparateSeededCompetitors,
  );

  await deps.savePoolDraft.save(competitionId, pools);

  return pools;
}
