import type { Brand } from "./brand.ts";
import type { CompetitionId } from "./competition-id.ts";

export type BracketRoundId = Brand<string, "BracketRoundId">;

export function makeBracketRoundId(
  competitionId: CompetitionId,
  roundNumber: number,
): BracketRoundId {
  return `${competitionId}:${roundNumber}` as BracketRoundId;
}

// --- THE THIRD-PLACE MATCH ISN'T A NUMBERED ROUND OF THE MAIN ELIMINATION LADDER (SEE
// BracketRoundRecord's `kind` FIELD) — A DEDICATED CONSTRUCTOR KEEPS THAT DISTINCTION AT THE ID
// LEVEL TOO, INSTEAD OF SLOTTING IT IN AS "JUST ONE MORE NUMBER" PAST THE LAST MAIN ROUND. ---
export function makeThirdPlaceBracketRoundId(competitionId: CompetitionId): BracketRoundId {
  return `${competitionId}:third-place` as BracketRoundId;
}
