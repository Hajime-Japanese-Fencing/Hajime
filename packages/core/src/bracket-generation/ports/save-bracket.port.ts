import type { CompetitionId } from "../../shared/competition-id.ts";
import type { Bracket } from "../../services/bracket/bracket.interface.ts";

export interface SaveBracketPort {
  save(competitionId: CompetitionId, bracket: Bracket): Promise<void>;
}
