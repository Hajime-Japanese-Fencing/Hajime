import type { CompetitionId } from "../../shared/competition-id.ts";
import type { CompetitionDraw } from "../../shared/competition-draw.ts";

export interface CompetitionDrawRepository {
  save(competitionId: CompetitionId, draw: CompetitionDraw): Promise<void>;
}
