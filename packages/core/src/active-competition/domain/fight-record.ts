import type { FightStatus } from "../../shared/fight-status.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { PoolId } from "../../shared/pool-id.ts";
import type { BracketRoundId } from "../../shared/bracket-round-id.ts";
import type { ScoreEvent } from "./score-event.ts";

export interface FightRecord {
  readonly id: FightId;
  // --- EXACTLY ONE OF poolId / bracketRoundId IS SET, DEPENDING ON WHETHER THIS FIGHT
  // BELONGS TO A POOL (ROUND-ROBIN) PHASE OR TO AN ELIMINATION BRACKET ROUND. ---
  readonly poolId: PoolId | null;
  readonly bracketRoundId: BracketRoundId | null;
  readonly redFighterId: FighterId;
  readonly whiteFighterId: FighterId;
  readonly status: FightStatus;
  readonly scoreEvents: ScoreEvent[];
}
