import type { PoolFighter } from "../distribution/pool-fighter.interface.ts";

export interface PoolFight {
  fighter1: PoolFighter;
  fighter2: PoolFighter;
}

export interface PoolTurn {
  order: number;
  fights: PoolFight[];
}
