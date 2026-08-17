import type { FightId } from "./fight-id.ts";
import type { FighterId } from "./fighter-id.ts";
import type { PoolId } from "./pool-id.ts";

export interface PoolRecord {
  readonly id: PoolId;
  readonly fighterIds: FighterId[];
  readonly fightIds: FightId[];
}
