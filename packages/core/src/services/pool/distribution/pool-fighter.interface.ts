import type { PoolFighterEntry } from "../../fighter.interface.ts";

export interface PoolFighter {
  fighter: PoolFighterEntry;
}

export function newPoolFighter(
  id: string,
  club: string = "club A",
  isSeriesHead: boolean = false,
): PoolFighter {
  return {
    fighter: {
      id: id,
      isSeriesHead: isSeriesHead,
      club: club,
    },
  };
}

export function toPoolFighter(fighter: PoolFighterEntry): PoolFighter {
  return {
    fighter: fighter,
  };
}
