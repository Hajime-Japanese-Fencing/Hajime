import type { PoolFighterEntry } from "../services/fighter.interface.ts";
import { generateBracket } from "../services/bracket/bracket-generation.service.ts";
import type { Bracket } from "../services/bracket/bracket.interface.ts";
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
  fighters: PoolFighterEntry[],
): Promise<Bracket> {
  const bracket = generateBracket(fighters);

  await deps.saveBracket.save(competitionId, bracket);

  return bracket;
}
