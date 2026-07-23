import type { FighterEntry } from "../../fighter.ts";

export interface PoolFighter {
  fighter: FighterEntry;
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

export function toPoolFighter(fighter: FighterEntry): PoolFighter {
  return {
    fighter: fighter,
  };
}
