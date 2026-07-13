import type { Fighter } from "../../fighter.interface.ts";

export interface PoolFighter {
  fighter: Fighter;
}

export function newPoolFighter(id: string, club: string = "club A", isSeriesHead: boolean = false, ): PoolFighter {
  return {
    fighter: {
      id: id,
      isSeriesHead: isSeriesHead,
      club: club
    }
  };
}

export function toPoolFighter(fighter: Fighter): PoolFighter {
  return {
    fighter: fighter
    }
}
