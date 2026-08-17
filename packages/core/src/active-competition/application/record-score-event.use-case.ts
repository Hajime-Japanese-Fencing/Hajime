import type { FighterId } from "../../shared/fighter-id.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { IpponCode } from "../../shared/ippons.ts";
import { makeScoreEventId, type ScoreEventId } from "../../shared/score-event-id.ts";
import type { FightRecord } from "../domain/fight-record.ts";
import {
  recordHansoku as applyHansoku,
  recordIppon as applyIppon,
} from "../domain/fight/score-event-rules.ts";
import { isRejection, type FightRuleResult } from "../domain/fight/fight-rules.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";
import type { FightActionResult } from "./command-result.ts";
import { toCommandRejection } from "./rejection-to-command-result.ts";

export interface RecordScoreEventDeps {
  saveFightResult: FightResultRecorder;
  state: ActiveCompetitionState;
}

export async function recordIppon(
  deps: RecordScoreEventDeps,
  fightId: FightId,
  fighterId: FighterId,
  code: IpponCode,
): Promise<FightActionResult> {
  return recordScoreEvent(deps, fightId, (fight, eventId) =>
    applyIppon(fight, fighterId, code, eventId),
  );
}

export async function recordHansoku(
  deps: RecordScoreEventDeps,
  fightId: FightId,
  fighterId: FighterId,
): Promise<FightActionResult> {
  return recordScoreEvent(deps, fightId, (fight, eventId) =>
    applyHansoku(fight, fighterId, eventId),
  );
}

async function recordScoreEvent(
  deps: RecordScoreEventDeps,
  fightId: FightId,
  apply: (fight: FightRecord, eventId: ScoreEventId) => FightRuleResult,
): Promise<FightActionResult> {
  const snapshot = deps.state.snapshot();
  const fight = snapshot.fightsById[fightId];
  if (!fight) return { ok: false, reason: "fight_not_found" };
  if (snapshot.activeFightId !== fightId) return { ok: false, reason: "not_active" };

  const updatedFight = apply(fight, makeScoreEventId(snapshot.nextScoreEventId));
  if (isRejection(updatedFight)) return toCommandRejection(updatedFight.reason);

  // --- recordHansoku CAN ADD TWO SCORE EVENTS IN ONE GO (THE HANSOKU ITSELF, PLUS AN
  // AUTO-AWARDED IPPON ONCE A FIGHTER REACHES THEIR 2ND/4TH/... HANSOKU) — SO nextScoreEventId
  // MUST ADVANCE BY HOW MANY EVENTS WERE ACTUALLY ADDED, NOT ALWAYS BY 1, OR THE NEXT SCORE
  // EVENT RECORDED WOULD REUSE AN ID THAT'S ALREADY TAKEN. ---
  const addedEventCount = updatedFight.scoreEvents.length - fight.scoreEvents.length;
  const nextScoreEventId = snapshot.nextScoreEventId + addedEventCount;

  deps.state.commitFight(updatedFight, snapshot.activeFightId, nextScoreEventId);
  await deps.saveFightResult.saveScoreEvents(fightId, updatedFight.scoreEvents);

  return { ok: true };
}
