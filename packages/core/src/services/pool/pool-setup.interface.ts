import type { PoolGroup } from "./pool-group.interface.ts";

export interface PoolSetup {
  poolGroups: PoolGroup[];
  nbFights: number;
}

export function toPoolSetup(poolGroups: PoolGroup[]): PoolSetup {
  return {
    poolGroups: poolGroups,
    nbFights: calculateNbFightsInPool(poolGroups),
  }
}

export function poolSetupEquals(setup1: PoolSetup, setup2: PoolSetup): boolean {
  if (setup1.poolGroups.length !== setup2.poolGroups.length) return false;

  // Redondant car pas censé arriver ?
  const sorted1 = [...setup1.poolGroups].sort((x, y) => x.poolSize - y.poolSize);
  const sorted2 = [...setup2.poolGroups].sort((x, y) => x.poolSize - y.poolSize);

  return sorted1.every(
      (group, i) => group.poolSize === sorted2[i].poolSize
          && group.amount === sorted2[i].amount
  );
}

export function calculateNbFightsInPool(poolGroups: PoolGroup[]): number {
  let nbFightsTotal = 0

  for (let group of poolGroups) {

    const nbFightsInPool = group.poolSize * (group.poolSize - 1) / 2
    // const nbFightsInPool = factorial(group.poolSize) / (2*(factorial(group.poolSize - 2)))

    nbFightsTotal += group.amount * nbFightsInPool
  }
  return nbFightsTotal
}


