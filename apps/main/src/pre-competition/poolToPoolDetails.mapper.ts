import type { Pool } from "@hajime/core";
import type { PoolDetails } from "@hajime/ui";
import { poolFighterToFighterDetails } from "./poolFighterToFighterDetails.mapper.ts";

export function poolToPoolDetails(pool: Pool): PoolDetails {
  return {
    poolId: pool.number,
    fighters: pool.fighters.map((f) => poolFighterToFighterDetails(f)),
  };
}
