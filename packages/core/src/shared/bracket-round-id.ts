import type { Brand } from "./brand.ts";
import type { CompetitionId } from "./competition-id.ts";

export type BracketRoundId = Brand<string, "BracketRoundId">;

export function makeBracketRoundId(
  competitionId: CompetitionId,
  roundNumber: number,
): BracketRoundId {
  return `${competitionId}:${roundNumber}` as BracketRoundId;
}

// Specific constructor for third place matches, since it's handled differently from other matches
// (not advancing winners, but taking losers from semi-finals instead)
export function makeThirdPlaceBracketRoundId(competitionId: CompetitionId): BracketRoundId {
  return `${competitionId}:third-place` as BracketRoundId;
}
