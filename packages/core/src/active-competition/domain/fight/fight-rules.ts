import { FightStatus } from "../../../shared/fight-status.ts";
import type { FightRecord } from "../fight-record.ts";

export type RejectionReason =
  | "illegal_transition"
  | "scoring_not_allowed"
  | "fighter_not_in_fight"
  | "score_event_not_found"
  | "score_event_type_mismatch";

export interface Rejection {
  readonly reason: RejectionReason;
}

export type FightRuleResult = FightRecord | Rejection;

export function startFight(fight: FightRecord): FightRuleResult {
  if (fight.status !== FightStatus.Waiting) return reject("illegal_transition");

  return { ...fight, status: FightStatus.InProgress };
}

export function cancelFight(fight: FightRecord): FightRuleResult {
  if (fight.status !== FightStatus.InProgress) return reject("illegal_transition");

  // --- CANCELLING SENDS THE FIGHT BACK TO "WAITING" AS IF IT HAD NEVER STARTED, SO ANY
  // IPPON/HANSOKU RECORDED DURING THIS ATTEMPT (INCLUDING AUTO-AWARDED IPPONS) IS DISCARDED
  // RATHER THAN CARRIED OVER TO THE NEXT TIME THIS FIGHT IS STARTED. ---
  return { ...fight, status: FightStatus.Waiting, scoreEvents: [] };
}

export function finishFight(fight: FightRecord): FightRuleResult {
  if (fight.status !== FightStatus.InProgress) return reject("illegal_transition");

  return { ...fight, status: FightStatus.Finished };
}

export function canScore(fight: FightRecord): boolean {
  return fight.status === FightStatus.InProgress;
}

export function isRejection(result: FightRuleResult): result is Rejection {
  return "reason" in result;
}

function reject(reason: RejectionReason): Rejection {
  return { reason };
}
