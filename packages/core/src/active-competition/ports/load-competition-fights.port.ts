import type { CompetitionId } from "../../shared/competition-id.ts";
import type { FightRecord } from "../domain/fight-record.ts";
import type { PoolRecord } from "../domain/pool-record.ts";

export interface CompetitionFightsData {
  pools: PoolRecord[];
  fights: FightRecord[];
}

export interface LoadCompetitionFightsPort {
  load(competitionId: CompetitionId): Promise<CompetitionFightsData>;
}
