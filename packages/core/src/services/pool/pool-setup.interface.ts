import type { PoolGroup } from "./pool-group.interface.ts";

export interface PoolSetup {
  poolGroups: PoolGroup[];
  nbFights: number;
}
