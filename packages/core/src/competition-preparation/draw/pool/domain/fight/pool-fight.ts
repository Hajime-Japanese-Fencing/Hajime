import type { PoolFighter } from "../distribution/pool-fighter.ts";
import { type FightId, makeFightId } from "../../../../../shared/fight-id.ts";

export interface PoolFight {
  id: FightId;
  fighter1: PoolFighter;
  fighter2: PoolFighter;
}

export interface PoolTurn {
  order: number;
  fights: PoolFight[];
}

export function makePoolFight(fighter1: PoolFighter, fighter2: PoolFighter): PoolFight {
  return {
    fighter1: fighter1,
    fighter2: fighter2,
    id: makeFightId(fighter1.fighter.id + fighter2.fighter.id),
  };
}
