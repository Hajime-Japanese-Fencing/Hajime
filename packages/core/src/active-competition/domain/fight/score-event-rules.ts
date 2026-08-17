import type { FighterId } from "../../../shared/fighter-id.ts";
import { IpponCode } from "../../../shared/ippons.ts";
import { makeScoreEventId, type ScoreEventId } from "../../../shared/score-event-id.ts";
import type { FightRecord } from "../../../shared/fight-record.ts";
import type { ScoreEvent, ScoreEventType } from "../../../shared/score-event.ts";
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

  const scoreEvents: ScoreEvent[] = [
    ...fight.scoreEvents,
    { id: eventId, fighterId, type: "hansoku", code: "Δ", firstBlood: false },
  ];

  const hansokuCount = countHansoku(fight.scoreEvents, fighterId) + 1;

  // --- EVERY *PAIR* OF HANSOKU AWARDS THE OPPONENT ONE MORE IPPON (2 -> 1 IPPON, 4 -> 2
  // IPPONS, ETC), MIRRORING THE REAL KENDO RULE. THE AUTO-AWARDED IPPON IS TAGGED WITH
  // IpponCode.Ippon RATHER THAN A NAMED STRIKE, SINCE IT WASN'T SCORED BY A TECHNIQUE — THAT
  // MARKER IS WHAT LETS removeScoreEvent TELL IT APART FROM A "REAL" IPPON LATER. ---
  if (hansokuCount % 2 === 0) {
    const opponentId = opponentOf(fight, fighterId);
    const ipponEventId = makeScoreEventId(eventId + 1);
    scoreEvents.push({
      id: ipponEventId,
      fighterId: opponentId,
      type: "ippon",
      code: IpponCode.Ippon,
      firstBlood: false,
    });
  }

  return {
    ...fight,
    scoreEvents: recalculateFirstBlood(scoreEvents),
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

  let scoreEvents = fight.scoreEvents.filter((event) => event.id !== scoreEventId);

  if (scoreEvent.type === "hansoku") {
    const remainingHansokuCount = countHansoku(scoreEvents, scoreEvent.fighterId);

    // --- DROPPING BELOW AN EVEN COUNT MEANS ONE FEWER PAIR OF HANSOKU IS "ACTIVE", SO ONE
    // FEWER AUTO-AWARDED IPPON SHOULD REMAIN FOR THE OPPONENT. WE REMOVE THE *LAST* ONE
    // (.at(-1)) RATHER THAN THE FIRST: THEY'RE OTHERWISE INTERCHANGEABLE FOR THE SCORE ITSELF,
    // BUT NOT FOR firstBlood — REMOVING THE EARLIEST ONE WOULD WRONGLY LET firstBlood SLIDE
    // ONTO A LATER, UNRELATED SCORE EVENT ONCE recalculateFirstBlood RUNS. ---
    if (remainingHansokuCount % 2 !== 0) {
      const opponentId = opponentOf(fight, scoreEvent.fighterId);
      const autoIpponEvents = scoreEvents.filter(
        (event) =>
          event.fighterId === opponentId &&
          event.type === "ippon" &&
          event.code === IpponCode.Ippon,
      );
      const ipponToRemove = autoIpponEvents.at(-1);

      if (ipponToRemove) {
        scoreEvents = scoreEvents.filter((event) => event.id !== ipponToRemove.id);
      }
    }
  }

  return {
    ...fight,
    scoreEvents: recalculateFirstBlood(scoreEvents),
  };
}

function scoringRejection(fight: FightRecord, fighterId: FighterId): Rejection | undefined {
  if (!canScore(fight)) return { reason: "scoring_not_allowed" };
  if (fighterId !== fight.redFighterId && fighterId !== fight.whiteFighterId) {
    return { reason: "fighter_not_in_fight" };
  }
}

function countHansoku(scoreEvents: readonly ScoreEvent[], fighterId: FighterId): number {
  return scoreEvents.filter((event) => event.type === "hansoku" && event.fighterId === fighterId)
    .length;
}

function opponentOf(fight: FightRecord, fighterId: FighterId): FighterId {
  return fight.redFighterId === fighterId ? fight.whiteFighterId : fight.redFighterId;
}

function recalculateFirstBlood(scoreEvents: readonly ScoreEvent[]): ScoreEvent[] {
  const firstIpponId = scoreEvents.find((event) => event.type === "ippon")?.id;

  return scoreEvents.map((event) =>
    event.type === "ippon" ? { ...event, firstBlood: event.id === firstIpponId } : event,
  );
}
