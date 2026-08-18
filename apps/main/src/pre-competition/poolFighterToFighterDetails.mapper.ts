import type { PoolFighter } from "@hajime/core";
import type { FighterDetails } from "@hajime/ui";

export function poolFighterToFighterDetails(
  poolFighter: PoolFighter,
  number: number,
): FighterDetails {
  return {
    // TEMPORARY: NO NAME IN FIGHTER ENTRY
    // ----------------------------------------------
    fighterName: poolFighter.fighter.id,
    // ----------------------------------------------
    poolRank: 0,
    number: number,
  };
}
