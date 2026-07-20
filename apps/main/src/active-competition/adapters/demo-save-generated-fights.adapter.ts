import type { CompetitionId, GeneratedFightsData, SaveGeneratedFightsPort } from "@hajime/core";

export class DemoSaveGeneratedFightsAdapter implements SaveGeneratedFightsPort {
  async saveGeneratedFights(
    competitionId: CompetitionId,
    data: GeneratedFightsData,
  ): Promise<void> {
    console.debug("[demo] saveGeneratedFights", competitionId, data);
  }
}
