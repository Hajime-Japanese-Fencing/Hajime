import type { CompetitionOverview } from "../domain/competition-overview.ts";

export interface SaveCompetitionPort {
  save(competition: CompetitionOverview): Promise<void>;
}
