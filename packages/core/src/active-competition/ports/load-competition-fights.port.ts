import type { CompetitionId } from "../../shared/competition-id.ts";
import type { CompetitionDraw } from "../domain/competition-draw.ts";

export interface CompetitionDrawLoader {
  load(competitionId: CompetitionId): Promise<CompetitionDraw>;
}
