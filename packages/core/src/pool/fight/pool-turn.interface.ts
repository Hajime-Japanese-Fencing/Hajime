import type { PoolFight } from "./pool-fight.interface.ts";

export interface PoolTurn {
  order: number;
  fights: PoolFight[];
}
