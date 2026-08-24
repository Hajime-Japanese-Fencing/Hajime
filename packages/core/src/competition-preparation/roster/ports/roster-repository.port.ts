import type { FighterEntry } from "../../../shared/fighter.ts";
import type { CompetitionId } from "../../../shared/competition-id.ts";

export interface RosterRepositoryPort {
  save(competitionId: CompetitionId, fighters: FighterEntry[]): Promise<void>;
  load(competitionId: CompetitionId): Promise<FighterEntry[]>;
}
