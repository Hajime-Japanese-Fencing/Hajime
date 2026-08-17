import type { CompetitionId } from "../../../../shared/competition-id.ts";
import type { Pool } from "../domain/pool.ts";
import type { SavePoolDraftPort } from "../ports/save-pool-draft.port.ts";

/**
 * Fake adapter for SavePoolDraftPort.
 * Designed for unit tests — stores state in-memory and exposes it for assertions.
 */
export class SpySavePoolDraftAdapter implements SavePoolDraftPort {
  private savedPools = new Map<CompetitionId, Pool[]>();
  public callCount = 0;

  async save(competitionId: CompetitionId, pools: Pool[]): Promise<void> {
    this.callCount++;
    this.savedPools.set(competitionId, pools);
  }

  getPools(competitionId: CompetitionId): Pool[] | undefined {
    return this.savedPools.get(competitionId);
  }
}
