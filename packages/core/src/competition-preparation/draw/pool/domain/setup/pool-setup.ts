export interface PoolGroup {
  poolSize: number;
  amount: number;
}

export interface PoolSetup {
  poolGroups: PoolGroup[];
  fightCount: number;
}

export function toPoolSetup(poolGroups: PoolGroup[]): PoolSetup {
  if (poolGroups.length == 0) {
    throw new Error("Input cannot be empty");
  }

  return {
    poolGroups: poolGroups,
    fightCount: calculateFightCount(poolGroups),
  };
}

export function poolSetupEquals(setup1: PoolSetup, setup2: PoolSetup): boolean {
  if (setup1.poolGroups.length !== setup2.poolGroups.length) return false;

  // Redondant car pas censé arriver ?
  const sorted1 = [...setup1.poolGroups].sort((x, y) => x.poolSize - y.poolSize);
  const sorted2 = [...setup2.poolGroups].sort((x, y) => x.poolSize - y.poolSize);

  return sorted1.every(
    (group, i) => group.poolSize === sorted2[i].poolSize && group.amount === sorted2[i].amount,
  );
}

export function calculateFightCount(poolGroups: PoolGroup[]): number {
  let fightCountTotal = 0;

  for (let group of poolGroups) {
    const fightCountInPool = (group.poolSize * (group.poolSize - 1)) / 2;
    // const fightCountInPool = factorial(group.poolSize) / (2*(factorial(group.poolSize - 2)))

    fightCountTotal += group.amount * fightCountInPool;
  }
  return fightCountTotal;
}
