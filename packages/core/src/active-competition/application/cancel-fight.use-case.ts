import type { FightId } from "../../shared/fight-id.ts";
import { cancelFight as applyCancelFight, isRejection } from "../domain/fight/fight-rules.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";
import type { FightActionResult } from "./command-result.ts";
import { toCommandRejection } from "./rejection-to-command-result.ts";

export interface CancelFightDeps {
  saveFightResult: FightResultRecorder;
  state: ActiveCompetitionState;
}

export async function cancelFight(
  deps: CancelFightDeps,
  fightId: FightId,
): Promise<FightActionResult> {
  const snapshot = deps.state.snapshot();
  const fight = snapshot.fightsById[fightId];
  if (!fight) return { ok: false, reason: "fight_not_found" };
  if (snapshot.activeFightId !== fightId) return { ok: false, reason: "not_active" };

  const updatedFight = applyCancelFight(fight);
  if (isRejection(updatedFight)) return toCommandRejection(updatedFight.reason);

  deps.state.commitFight(updatedFight, null, snapshot.nextScoreEventId);
  await deps.saveFightResult.updateStatus(fightId, updatedFight.status);
  // --- applyCancelFight ALSO WIPES scoreEvents (SEE fight-rules.ts) — PERSIST THAT SO A
  // REFRESH / RELOAD DOESN'T BRING BACK THE DISCARDED IPPONS/HANSOKU. ---
  await deps.saveFightResult.saveScoreEvents(fightId, updatedFight.scoreEvents);

  return { ok: true };
}
