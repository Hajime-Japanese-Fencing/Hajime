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
import type { SaveFightResultPort } from "../ports/save-fight-result.port.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";
import type { CommandResult } from "./command-result.ts";
import { toCommandRejection } from "./rejection-to-command-result.ts";

export interface RecordScoreEventDeps {
  saveFightResult: SaveFightResultPort;
  state: ActiveCompetitionState;
}

export async function recordIppon(
  deps: RecordScoreEventDeps,
  fightId: FightId,
  fighterId: FighterId,
  code: IpponCode,
): Promise<CommandResult> {
  return recordScoreEvent(deps, fightId, (fight, eventId) =>
    applyIppon(fight, fighterId, code, eventId),
  );
}

export async function recordHansoku(
  deps: RecordScoreEventDeps,
  fightId: FightId,
  fighterId: FighterId,
): Promise<CommandResult> {
  return recordScoreEvent(deps, fightId, (fight, eventId) =>
    applyHansoku(fight, fighterId, eventId),
  );
}

async function recordScoreEvent(
  deps: RecordScoreEventDeps,
  fightId: FightId,
  apply: (fight: FightRecord, eventId: ScoreEventId) => FightRuleResult,
): Promise<CommandResult> {
  const snapshot = deps.state.snapshot();
  const fight = snapshot.fightsById[fightId];
  if (!fight) return { ok: false, reason: "fight_not_found" };
  if (snapshot.activeFightId !== fightId) return { ok: false, reason: "not_active" };

  const updatedFight = apply(fight, makeScoreEventId(snapshot.nextScoreEventId));
  if (isRejection(updatedFight)) return toCommandRejection(updatedFight.reason);

  deps.state.commitFight(updatedFight, snapshot.activeFightId, snapshot.nextScoreEventId + 1);
  await deps.saveFightResult.saveScoreEvents(fightId, updatedFight.scoreEvents);

  return { ok: true };
}
