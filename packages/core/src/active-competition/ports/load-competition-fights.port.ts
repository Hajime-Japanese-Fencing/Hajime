import type { CompetitionId } from "../../shared/competition-id.ts";
import type { CompetitionDraw } from "../../shared/competition-draw.ts";

export interface CompetitionDrawLoader {
  load(competitionId: CompetitionId): Promise<CompetitionDraw>;
}
