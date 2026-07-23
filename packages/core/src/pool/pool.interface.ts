import { type PoolFighter } from "./distribution/pool-fighter.interface.ts";

export interface Pool {
  number: number;
  size: number;
  fighters: PoolFighter[];
}
