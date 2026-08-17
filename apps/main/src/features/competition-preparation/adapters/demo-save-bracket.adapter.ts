import type { Bracket, CompetitionId, SaveBracketPort } from "@hajime/core";

export class DemoSaveBracketAdapter implements SaveBracketPort {
  async save(competitionId: CompetitionId, bracket: Bracket): Promise<void> {
    console.debug("[demo] save bracket", competitionId, bracket);
  }
}
