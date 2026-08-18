import type { Bracket, CompetitionId, SaveBracketPort } from "@hajime/core";
import { bracketDraftStore } from "../../../persistence/bracket-draft.store.ts";

export class LocalStorageSaveBracketAdapter implements SaveBracketPort {
  async save(competitionId: CompetitionId, bracket: Bracket): Promise<void> {
    bracketDraftStore.set(competitionId, bracket);
  }
}
