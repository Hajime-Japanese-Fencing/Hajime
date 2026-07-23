import type { FighterEntry } from "../shared/fighter.ts";
import { generateBracket } from "./domain/generate-bracket.service.ts";
import type { Bracket } from "./domain/bracket.interface.ts";
import type { CompetitionId } from "../shared/competition-id.ts";
import type { SaveBracketPort } from "./ports/save-bracket.port.ts";

export interface GenerateBracketUseCaseDeps {
  saveBracket: SaveBracketPort;
}

/**
 * Generates a direct-elimination bracket for a competition and persists it.
 *
 * Orchestration only — the bracket construction itself (byes, pairing, rounds)
 * lives in the pure domain service `generateBracket`.
 */
export async function generateBracketUseCase(
  deps: GenerateBracketUseCaseDeps,
  competitionId: CompetitionId,
  fighters: FighterEntry[],
): Promise<Bracket> {
  const bracket = generateBracket(fighters);

  await deps.saveBracket.save(competitionId, bracket);

  return bracket;
}
