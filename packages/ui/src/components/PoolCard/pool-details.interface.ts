import type { FighterDetails } from "./fighter-details.interface.ts";

export interface PoolDetails {
  poolId: number;
  fighters: FighterDetails[];
}
