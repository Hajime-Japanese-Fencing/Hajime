import type { CompetitionId } from "../../shared/competition-id.ts";
import type { CompetitionDraw } from "../domain/competition-draw.ts";

export interface CompetitionDrawRepository {
  save(competitionId: CompetitionId, draw: CompetitionDraw): Promise<void>;
}
