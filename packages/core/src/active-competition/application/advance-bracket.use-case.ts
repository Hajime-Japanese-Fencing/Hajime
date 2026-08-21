import { FightStatus } from "../../shared/fight-status.ts";
import { makeFightId, type FightId } from "../../shared/fight-id.ts";
import { determineFightWinner } from "../domain/fight/fight-winner.ts";
import { fillNextRoundSlot } from "../domain/bracket-progression.ts";
import type { BracketRoundRecord } from "../../shared/bracket-round-record.ts";
import type { FightRecord } from "../../shared/fight-record.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";
import type { IdGenerator } from "../../shared/id-generator.ts";

export type AdvanceBracketResult =
  | { ok: true; promotedFightIds: FightId[] }
  | {
      ok: false;
      reason: "fight_not_found" | "not_a_bracket_fight" | "not_finished" | "no_winner_yet";
    };

export interface AdvanceBracketDeps {
  state: ActiveCompetitionState;
  generateId: IdGenerator;
}

/**
 * Progresses the bracket after one of its fights has finished: works out the winner (and
 * loser), slots each into their respective next match, and — once both sides of a match are
 * known — mints the FightRecord for it so it becomes playable.
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

  // --- A BYE (whiteFighterId === null) HAS NO REAL LOSER TO PROPAGATE, AND ITS ADVANCEMENT
  // INTO THE NEXT ROUND WAS ALREADY BAKED IN AT GENERATION TIME (SEE buildBracketDraw) — SO
  // THERE'S NOTHING LEFT TO DO HERE. THIS IS UNREACHABLE IN PRACTICE (A BYE IS CREATED
  // DIRECTLY AS "finished" AND CAN NEVER BECOME THE ACTIVE FIGHT), BUT KEEPS loserId BELOW
  // SOUNDLY TYPED AS A REAL FighterId RATHER THAN FighterId | null. ---
  if (fight.whiteFighterId === null) return { ok: true, promotedFightIds: [] };

  const loserId = winnerId === fight.redFighterId ? fight.whiteFighterId : fight.redFighterId;

  const bracketRounds = fillNextRoundSlot(
    Object.values(snapshot.bracketRoundsById),
    fight,
    winnerId,
    loserId,
  );

  const { updatedRounds, newFights, promotedFightIds } = promoteReadyMatches(
    bracketRounds,
    deps.generateId,
  );

  deps.state.advanceBracket({ bracketRounds: updatedRounds, newFights });

  return { ok: true, promotedFightIds };
}

// --- TURNS ANY PENDING MATCH THAT NOW HAS BOTH FIGHTERS KNOWN INTO A REAL, PLAYABLE
// FightRecord, MINTING FRESH FIGHT IDS AS IT GOES. LEAVES ROUNDS WITH NOTHING TO PROMOTE
// UNTOUCHED (SAME OBJECT REFERENCE) SO CALLERS CAN CHEAPLY TELL WHAT CHANGED. ---
function promoteReadyMatches(
  bracketRounds: BracketRoundRecord[],
  generateId: IdGenerator,
): {
  updatedRounds: BracketRoundRecord[];
  newFights: FightRecord[];
  promotedFightIds: FightId[];
} {
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
      const newFightId = makeFightId(generateId());

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

  return { updatedRounds, newFights, promotedFightIds };
}
