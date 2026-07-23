import type { CompetitionId } from "../../shared/competition-id.ts";
import type { Bracket } from "../domain/bracket.ts";
import type { SaveBracketPort } from "../ports/save-bracket.port.ts";

/**
 * Fake adapter for SaveBracketPort.
 * Designed for unit tests — stores state in-memory and exposes it for assertions.
 */
export class SpySaveBracketAdapter implements SaveBracketPort {
  private savedBrackets = new Map<CompetitionId, Bracket>();
  public callCount = 0;

  async save(competitionId: CompetitionId, bracket: Bracket): Promise<void> {
    this.callCount++;
    this.savedBrackets.set(competitionId, bracket);
  }

  getBracket(competitionId: CompetitionId): Bracket | undefined {
    return this.savedBrackets.get(competitionId);
  }
}
