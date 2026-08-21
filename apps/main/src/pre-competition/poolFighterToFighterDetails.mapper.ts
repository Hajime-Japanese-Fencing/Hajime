import type { PoolFighter } from "@hajime/core";
import type { FighterDetails } from "@hajime/ui";

export function poolFighterToFighterDetails(
  poolFighter: PoolFighter,
  number: number,
): FighterDetails {
  return {
    fighterName: poolFighter.fighter.name,
    poolRank: 1,
    number: number,
  };
}
