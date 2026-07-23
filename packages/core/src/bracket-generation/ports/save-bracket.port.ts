import type { CompetitionId } from "../../shared/competition-id.ts";
import type { Bracket } from "../domain/bracket.ts";

export interface SaveBracketPort {
  save(competitionId: CompetitionId, bracket: Bracket): Promise<void>;
}
