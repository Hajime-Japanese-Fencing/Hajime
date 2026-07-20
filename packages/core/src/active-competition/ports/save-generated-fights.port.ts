import type { CompetitionId } from "../../shared/competition-id.ts";
import type { PoolRecord } from "../domain/pool-record.ts";
import type { FightRecord } from "../domain/fight-record.ts";

export interface GeneratedFightsData {
  pools: PoolRecord[];
  fights: FightRecord[];
}

export interface SaveGeneratedFightsPort {
  saveGeneratedFights(competitionId: CompetitionId, data: GeneratedFightsData): Promise<void>;
}
