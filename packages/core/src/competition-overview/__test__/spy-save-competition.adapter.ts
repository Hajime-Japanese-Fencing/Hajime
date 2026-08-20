import type { CompetitionId } from "../../shared/competition-id.ts";
import type { CompetitionOverview } from "../domain/competition-overview.ts";
import type { SaveCompetitionPort } from "../ports/save-competition.port.ts";

/**
 * Fake adapter for SaveCompetitionPort.
 * Designed for unit tests — stores state in-memory and exposes it for assertions.
 */
export class SpySaveCompetitionAdapter implements SaveCompetitionPort {
  private savedCompetitions = new Map<CompetitionId, CompetitionOverview>();
  public callCount = 0;

  async save(competition: CompetitionOverview): Promise<void> {
    this.callCount++;
    this.savedCompetitions.set(competition.id, competition);
  }

  getCompetition(competitionId: CompetitionId): CompetitionOverview | undefined {
    return this.savedCompetitions.get(competitionId);
  }
}
