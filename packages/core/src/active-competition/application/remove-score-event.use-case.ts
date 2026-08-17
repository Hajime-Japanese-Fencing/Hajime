import type { FightId } from "../../shared/fight-id.ts";
import type { ScoreEventId } from "../../shared/score-event-id.ts";
import { removeScoreEvent as applyRemoveScoreEvent } from "../domain/fight/score-event-rules.ts";
import { isRejection } from "../domain/fight/fight-rules.ts";
import type { ScoreEventType } from "../../shared/score-event.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";
import type { FightActionResult } from "./command-result.ts";
import { toCommandRejection } from "./rejection-to-command-result.ts";

export interface RemoveScoreEventDeps {
  saveFightResult: FightResultRecorder;
  state: ActiveCompetitionState;
}

export async function removeScoreEvent(
  deps: RemoveScoreEventDeps,
  fightId: FightId,
  scoreEventId: ScoreEventId,
  expectedType: ScoreEventType,
): Promise<FightActionResult> {
  const snapshot = deps.state.snapshot();
  const fight = snapshot.fightsById[fightId];
  if (!fight) return { ok: false, reason: "fight_not_found" };
  if (snapshot.activeFightId !== fightId) return { ok: false, reason: "not_active" };

  const updatedFight = applyRemoveScoreEvent(fight, scoreEventId, expectedType);
  if (isRejection(updatedFight)) return toCommandRejection(updatedFight.reason);

  deps.state.commitFight(updatedFight, snapshot.activeFightId, snapshot.nextScoreEventId);
  await deps.saveFightResult.saveScoreEvents(fightId, updatedFight.scoreEvents);

  return { ok: true };
}
