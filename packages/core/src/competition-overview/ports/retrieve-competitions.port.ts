import type { CompetitionOverview } from "../domain/competition-overview.ts";

export interface RetrieveCompetitionsQuery {
  retrieveAll(): Promise<CompetitionOverview[]>;
}
