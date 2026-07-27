import type { FighterId } from "../../../shared/fighter-id.ts";
import type { IpponCode } from "../../../shared/ippons.ts";
import type { ScoreEventId } from "../../../shared/score-event-id.ts";
import type { FightRecord } from "../fight-record.ts";
import type { ScoreEvent, ScoreEventType } from "../score-event.ts";
import { canScore, type FightRuleResult, type Rejection } from "./fight-rules.ts";

export function recordIppon(
  fight: FightRecord,
  fighterId: FighterId,
  code: IpponCode,
  eventId: ScoreEventId,
): FightRuleResult {
  const rejection = scoringRejection(fight, fighterId);
  if (rejection) return rejection;

  return {
    ...fight,
    scoreEvents: recalculateFirstBlood([
      ...fight.scoreEvents,
      { id: eventId, fighterId, type: "ippon", code, firstBlood: false },
    ]),
  };
}

export function recordHansoku(
  fight: FightRecord,
  fighterId: FighterId,
  eventId: ScoreEventId,
): FightRuleResult {
  const rejection = scoringRejection(fight, fighterId);
  if (rejection) return rejection;

  return {
    ...fight,
    scoreEvents: [
      ...fight.scoreEvents,
      { id: eventId, fighterId, type: "hansoku", code: "Δ", firstBlood: false },
    ],
  };
}

export function removeScoreEvent(
  fight: FightRecord,
  scoreEventId: ScoreEventId,
  expectedType: ScoreEventType,
): FightRuleResult {
  if (!canScore(fight)) return { reason: "scoring_not_allowed" };

  const scoreEvent = fight.scoreEvents.find((event) => event.id === scoreEventId);
  if (!scoreEvent) return { reason: "score_event_not_found" };
  if (scoreEvent.type !== expectedType) return { reason: "score_event_type_mismatch" };

  return {
    ...fight,
    scoreEvents: recalculateFirstBlood(
      fight.scoreEvents.filter((event) => event.id !== scoreEventId),
    ),
  };
}

function scoringRejection(fight: FightRecord, fighterId: FighterId): Rejection | undefined {
  if (!canScore(fight)) return { reason: "scoring_not_allowed" };
  if (fighterId !== fight.redFighterId && fighterId !== fight.whiteFighterId) {
    return { reason: "fighter_not_in_fight" };
  }
}

function recalculateFirstBlood(scoreEvents: readonly ScoreEvent[]): ScoreEvent[] {
  const firstIpponId = scoreEvents.find((event) => event.type === "ippon")?.id;

  return scoreEvents.map((event) =>
    event.type === "ippon" ? { ...event, firstBlood: event.id === firstIpponId } : event,
  );
}
