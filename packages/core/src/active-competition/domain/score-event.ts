import type { IpponCode } from "../../shared/ippons.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import type { ScoreEventId } from "../../shared/score-event-id.ts";

export type ScoreEventType = "ippon" | "hansoku";

export interface ScoreEvent {
  readonly id: ScoreEventId;
  readonly fighterId: FighterId;
  readonly type: ScoreEventType;
  readonly code: IpponCode | "Δ";
  readonly firstBlood: boolean;
}
