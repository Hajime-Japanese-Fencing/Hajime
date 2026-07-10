import type { Fighter } from "../../fighter.interface.ts";

export interface PoolFighter {
  fighter: Fighter;
}

export function toPoolFighter(fighter: Fighter): PoolFighter {
  return {
    fighter: fighter,
  };
}
