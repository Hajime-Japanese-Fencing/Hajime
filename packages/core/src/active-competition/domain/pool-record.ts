import type { FightId } from "../../shared/fight-id.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import type { PoolId } from "../../shared/pool-id.ts";

export interface PoolRecord {
  readonly id: PoolId;
  readonly fighterIds: FighterId[];
  readonly fightIds: FightId[];
}
