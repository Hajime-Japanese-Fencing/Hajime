import type { FighterEntry } from "../../shared/fighter.ts";

export interface PoolFighter {
  fighter: FighterEntry;
}

export function toPoolFighter(fighter: FighterEntry): PoolFighter {
  return {
    fighter: fighter,
  };
}
