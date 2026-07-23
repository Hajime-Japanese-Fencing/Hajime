import type { FightStatus } from "../../shared/fight-status.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { PoolId } from "../../shared/pool-id.ts";
import type { ScoreEvent } from "./score-event.ts";

export interface FightRecord {
  readonly id: FightId;
  readonly poolId: PoolId;
  readonly redFighterId: FighterId;
  readonly whiteFighterId: FighterId;
  readonly status: FightStatus;
  readonly scoreEvents: ScoreEvent[];
}
