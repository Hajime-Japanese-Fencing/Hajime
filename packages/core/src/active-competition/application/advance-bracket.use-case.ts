import { FightStatus } from "../../shared/fight-status.ts";
import { makeFightId, type FightId } from "../../shared/fight-id.ts";
import { determineFightWinner } from "../domain/fight/fight-winner.ts";
import { fillNextRoundSlot } from "../domain/bracket-progression.ts";
import type { BracketRoundRecord } from "../domain/bracket-round-record.ts";
import type { FightRecord } from "../domain/fight-record.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";

export type AdvanceBracketResult =
  | { ok: true; promotedFightIds: FightId[] }
  | {
      ok: false;
      reason: "fight_not_found" | "not_a_bracket_fight" | "not_finished" | "no_winner_yet";
    };

export interface AdvanceBracketDeps {
  state: ActiveCompetitionState;
}

/**
 * Progresses the bracket after one of its fights has finished: works out the winner, slots
 * it into the next round's match, and — once both sides of that match are known — mints the
 * FightRecord for it so it becomes playable.
 *
 * Pure orchestration: the winner rule lives in `determineFightWinner`, the slotting logic in
 * `fillNextRoundSlot`. Only the "turn a ready pending match into a real fight" part (needs a
 * fresh FightId) lives here, since that's a stateful concern.
 *
 * Reports why nothing happened rather than silently no-op'ing: the fight might not be a
 * bracket fight, not be finished yet, or currently be tied with no recorded decision (no
 * hantei/forfeit modelled as a score event yet) — none of those are actual failures, just
 * reasons there's nothing to advance right now.
 */
export async function advanceBracket(
  deps: AdvanceBracketDeps,
  fightId: FightId,
): Promise<AdvanceBracketResult> {
  const snapshot = deps.state.snapshot();
  const fight = snapshot.fightsById[fightId];
  if (!fight) return { ok: false, reason: "fight_not_found" };

  if (fight.bracketRoundId === null || fight.bracketMatchIndex === null) {
    return { ok: false, reason: "not_a_bracket_fight" };
  }
  if (fight.status !== FightStatus.Finished) return { ok: false, reason: "not_finished" };

  const winnerId = determineFightWinner(fight);
  if (!winnerId) return { ok: false, reason: "no_winner_yet" };

  const bracketRounds = fillNextRoundSlot(
    Object.values(snapshot.bracketRoundsById),
    fight,
    winnerId,
  );

  const { updatedRounds, newFights, nextFightId, promotedFightIds } = promoteReadyMatches(
    bracketRounds,
    snapshot.nextFightId,
  );

  deps.state.advanceBracket({ bracketRounds: updatedRounds, newFights, nextFightId });

  return { ok: true, promotedFightIds };
}

// --- TURNS ANY PENDING MATCH THAT NOW HAS BOTH FIGHTERS KNOWN INTO A REAL, PLAYABLE
// FightRecord, MINTING FRESH FIGHT IDS AS IT GOES. LEAVES ROUNDS WITH NOTHING TO PROMOTE
// UNTOUCHED (SAME OBJECT REFERENCE) SO CALLERS CAN CHEAPLY TELL WHAT CHANGED. ---
function promoteReadyMatches(
  bracketRounds: BracketRoundRecord[],
  startingNextFightId: number,
): {
  updatedRounds: BracketRoundRecord[];
  newFights: FightRecord[];
  nextFightId: number;
  promotedFightIds: FightId[];
} {
  let nextFightId = startingNextFightId;
  const newFights: FightRecord[] = [];
  const promotedFightIds: FightId[] = [];

  const updatedRounds = bracketRounds.map((round) => {
    const stillPending = round.pendingMatches.filter(
      (match) => match.fighter1 === null || match.fighter2 === null,
    );

    if (stillPending.length === round.pendingMatches.length) return round;

    const readyMatches = round.pendingMatches.filter(
      (match) => match.fighter1 !== null && match.fighter2 !== null,
    );

    const fightIds = [...round.fightIds];
    for (const match of readyMatches) {
      const newFightId = makeFightId(nextFightId++);

      newFights.push({
        id: newFightId,
        poolId: null,
        bracketRoundId: round.id,
        bracketMatchIndex: match.matchIndex,
        redFighterId: match.fighter1!,
        whiteFighterId: match.fighter2!,
        status: FightStatus.Waiting,
        scoreEvents: [],
      });
      fightIds.push(newFightId);
      promotedFightIds.push(newFightId);
    }

    return { ...round, fightIds, pendingMatches: stillPending };
  });

  return { updatedRounds, newFights, nextFightId, promotedFightIds };
}
