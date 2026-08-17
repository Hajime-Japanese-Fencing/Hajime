import type { CompetitionId } from "../../../../shared/competition-id.ts";
import type { Pool } from "../domain/pool.ts";

export interface SavePoolDraftPort {
  save(competitionId: CompetitionId, pools: Pool[]): Promise<void>;
}
