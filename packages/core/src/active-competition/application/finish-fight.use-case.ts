import type { FightId } from "../../shared/fight-id.ts";
import { finishFight as applyFinishFight, isRejection } from "../domain/fight/fight-rules.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";
import type { FightActionResult } from "./command-result.ts";
import { toCommandRejection } from "./rejection-to-command-result.ts";
import { advanceBracket } from "./advance-bracket.use-case.ts";
import type { IdGenerator } from "../../shared/id-generator.ts";

export interface FinishFightDeps {
  saveFightResult: FightResultRecorder;
  state: ActiveCompetitionState;
  generateId: IdGenerator;
}

export async function finishFight(
  deps: FinishFightDeps,
  fightId: FightId,
): Promise<FightActionResult> {
  const snapshot = deps.state.snapshot();
  const fight = snapshot.fightsById[fightId];
  if (!fight) return { ok: false, reason: "fight_not_found" };
  if (snapshot.activeFightId !== fightId) return { ok: false, reason: "not_active" };

  const updatedFight = applyFinishFight(fight);
  if (isRejection(updatedFight)) return toCommandRejection(updatedFight.reason);

  deps.state.commitFight(updatedFight, null, snapshot.nextScoreEventId);
  await deps.saveFightResult.updateStatus(fightId, updatedFight.status);

  // --- IF THIS WAS A BRACKET FIGHT, TRY TO PROGRESS THE BRACKET (SLOT THE WINNER INTO THE
  // NEXT ROUND, PROMOTE IT INTO A REAL FIGHT IF BOTH SIDES ARE NOW KNOWN). A NO-OP FOR POOL
  // FIGHTS, AND HARMLESS IF THE RESULT IS CURRENTLY TIED (NOTHING TO ADVANCE YET) — EITHER
  // WAY finishFight ITSELF STILL SUCCEEDED, SO WE DON'T SURFACE advanceBracket's OUTCOME. ---
  await advanceBracket({ state: deps.state, generateId: deps.generateId }, fightId);

  return { ok: true };
}
