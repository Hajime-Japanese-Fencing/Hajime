import type { FightId } from "../../shared/fight-id.ts";
import { isRejection, startFight as applyStartFight } from "../domain/fight/fight-rules.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";
import type { FightActionResult } from "./command-result.ts";
import { toCommandRejection } from "./rejection-to-command-result.ts";

export interface StartFightDeps {
  saveFightResult: FightResultRecorder;
  state: ActiveCompetitionState;
}

export async function startFight(
  deps: StartFightDeps,
  fightId: FightId,
): Promise<FightActionResult> {
  const snapshot = deps.state.snapshot();
  const fight = snapshot.fightsById[fightId];
  if (!fight) return { ok: false, reason: "fight_not_found" };
  if (snapshot.activeFightId !== null) return { ok: false, reason: "not_active" };

  const updatedFight = applyStartFight(fight);
  if (isRejection(updatedFight)) return toCommandRejection(updatedFight.reason);

  deps.state.commitFight(updatedFight, fightId, snapshot.nextScoreEventId);
  await deps.saveFightResult.updateStatus(fightId, updatedFight.status);

  return { ok: true };
}
