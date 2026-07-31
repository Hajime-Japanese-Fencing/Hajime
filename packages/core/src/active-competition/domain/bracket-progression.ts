import type { FighterId } from "../../shared/fighter-id.ts";
import type { FightRecord } from "./fight-record.ts";
import type { BracketRoundRecord } from "./bracket-round-record.ts";

/**
 * Slots a finished bracket fight's winner into the next round's pending match, immutably.
 *
 * Does nothing if the fight isn't a bracket fight (no bracketRoundId/bracketMatchIndex), or
 * if it was the final (no next round to feed into). Doesn't create a FightRecord even once a
 * match's two slots are both filled — that promotion is an application-level concern since it
 * needs to mint a new FightId, see the `advance-bracket` use-case.
 */
export function fillNextRoundSlot(
  bracketRounds: readonly BracketRoundRecord[],
  finishedFight: FightRecord,
  winnerId: FighterId,
): BracketRoundRecord[] {
  if (finishedFight.bracketRoundId === null || finishedFight.bracketMatchIndex === null) {
    return [...bracketRounds];
  }

  const currentRound = bracketRounds.find((round) => round.id === finishedFight.bracketRoundId);
  if (!currentRound) return [...bracketRounds];

  const nextRound = bracketRounds.find((round) => round.order === currentRound.order + 1);
  if (!nextRound) return [...bracketRounds];

  const nextMatchIndex = Math.floor(finishedFight.bracketMatchIndex / 2);
  // --- EVEN INDEX -> fighter1 OF THE NEXT MATCH, ODD -> fighter2, MIRRORING THE DRAW'S OWN
  // advanceWinner LOGIC IN generate-bracket.service.ts ---
  const slot = finishedFight.bracketMatchIndex % 2 === 0 ? "fighter1" : "fighter2";

  return bracketRounds.map((round) => {
    if (round.id !== nextRound.id) return round;

    return {
      ...round,
      pendingMatches: round.pendingMatches.map((match) =>
        match.matchIndex === nextMatchIndex ? { ...match, [slot]: winnerId } : match,
      ),
    };
  });
}
