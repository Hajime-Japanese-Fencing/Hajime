import type { CompetitionDraw, CompetitionDrawRepository, CompetitionId } from "@hajime/core";

export class DemoSaveGeneratedFightsAdapter implements CompetitionDrawRepository {
  async save(competitionId: CompetitionId, draw: CompetitionDraw): Promise<void> {
    console.debug("[demo] save competition draw", competitionId, draw);
  }
}
