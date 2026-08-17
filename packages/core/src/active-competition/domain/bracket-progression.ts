import type { FighterId } from "../../shared/fighter-id.ts";
import type { FightRecord } from "../../shared/fight-record.ts";
import type { BracketRoundId } from "../../shared/bracket-round-id.ts";
import type { BracketRoundRecord } from "../../shared/bracket-round-record.ts";

/**
 * Slots a finished bracket fight's winner (and, when the round has one, its loser) into their
 * respective next matches, immutably.
 *
 * Does nothing if the fight isn't a bracket fight (no bracketRoundId/bracketMatchIndex). The
 * winner goes to `currentRound.feedsRoundId` (null for the final and the third-place match,
 * neither of which feeds anything further); the loser goes to `currentRound.loserFeedsRoundId`
 * when set (only the semi-finals have one, feeding the third-place match). Doesn't create a
 * FightRecord even once a match's two slots are both filled — that promotion is an
 * application-level concern since it needs to mint a new FightId, see the `advance-bracket`
 * use-case.
 */
export function fillNextRoundSlot(
  bracketRounds: readonly BracketRoundRecord[],
  finishedFight: FightRecord,
  winnerId: FighterId,
  loserId: FighterId,
): BracketRoundRecord[] {
  if (finishedFight.bracketRoundId === null || finishedFight.bracketMatchIndex === null) {
    return [...bracketRounds];
  }

  const currentRound = bracketRounds.find((round) => round.id === finishedFight.bracketRoundId);
  if (!currentRound) return [...bracketRounds];

  let rounds = bracketRounds;
  if (currentRound.feedsRoundId !== null) {
    rounds = placeInRound(
      rounds,
      currentRound.feedsRoundId,
      finishedFight.bracketMatchIndex,
      winnerId,
    );
  }
  if (currentRound.loserFeedsRoundId) {
    rounds = placeInRound(
      rounds,
      currentRound.loserFeedsRoundId,
      finishedFight.bracketMatchIndex,
      loserId,
    );
  }

  return [...rounds];
}

// --- SHARED BY BOTH THE WINNER AND LOSER PATHS: A ROUND'S MATCH matchIndex ALWAYS FEEDS
// floor(matchIndex / 2) OF THE TARGET ROUND, EVEN -> fighter1, ODD -> fighter2. THIS HOLDS FOR
// THE THIRD-PLACE ROUND TOO, SINCE IT ONLY EVER RECEIVES FROM THE TWO SEMI-FINAL MATCHES
// (INDEX 0 AND 1), MIRRORING THE FINAL'S OWN SINGLE-MATCH SHAPE. ---
function placeInRound(
  bracketRounds: readonly BracketRoundRecord[],
  targetRoundId: BracketRoundId,
  matchIndex: number,
  fighterId: FighterId,
): readonly BracketRoundRecord[] {
  const targetRound = bracketRounds.find((round) => round.id === targetRoundId);
  if (!targetRound) return bracketRounds;

  const nextMatchIndex = Math.floor(matchIndex / 2);
  const slot = matchIndex % 2 === 0 ? "fighter1" : "fighter2";

  return bracketRounds.map((round) => {
    if (round.id !== targetRoundId) return round;

    return {
      ...round,
      pendingMatches: round.pendingMatches.map((match) =>
        match.matchIndex === nextMatchIndex ? { ...match, [slot]: fighterId } : match,
      ),
    };
  });
}
