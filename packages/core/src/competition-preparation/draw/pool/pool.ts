import { type PoolFighter } from "./distribution/pool-fighter.ts";

export interface Pool {
  number: number;
  size: number;
  fighters: PoolFighter[];
}
