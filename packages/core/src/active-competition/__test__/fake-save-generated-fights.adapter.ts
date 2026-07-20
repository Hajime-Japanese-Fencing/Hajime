import type {
  GeneratedFightsData,
  SaveGeneratedFightsPort,
} from "../ports/save-generated-fights.port.ts";
import type { CompetitionId } from "../../shared/competition-id.ts";

export class FakeSaveGeneratedFightsAdapter implements SaveGeneratedFightsPort {
  private savedFights = new Map<CompetitionId, GeneratedFightsData>();

  async saveGeneratedFights(
    competitionId: CompetitionId,
    data: GeneratedFightsData,
  ): Promise<void> {
    this.savedFights.set(competitionId, data);
  }

  getGeneratedFights(competitionId: CompetitionId): GeneratedFightsData | undefined {
    return this.savedFights.get(competitionId);
  }
}
