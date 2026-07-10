import { type PoolSetup, poolSetupEquals, toPoolSetup } from "./pool-setup.interface.ts";
import type { Fighter } from "../fighter.interface.ts";
import type { Pool } from "../pool.interface.ts";
import { toPoolFighter } from "./pool-fighter.interface.ts";

export function calculatePossiblePoolSetups(nbFighters: number): PoolSetup[] {
  // --- TESTING FOR INCORRECT INPUTS ---
  if (!Number.isInteger(nbFighters) || nbFighters < 0) {
    throw new Error("number of fighters must be a positive integer");
  }
  if (nbFighters < 4) {
    throw new Error("cannot create pools for less than 4 fighters");
  }

  // --- CALCULATING SETUPS ---
  const possiblePoolSetups: PoolSetup[] = [];
  const maxPoolSize = Math.ceil(nbFighters / 2);

  for (let poolSize = 3; poolSize <= maxPoolSize; poolSize++) {
    let nbExcessFighters = nbFighters % poolSize;
    let totalPoolNb = Math.floor(nbFighters / poolSize);

    // --- "PERFECT" CASE (number of players = a * poolSize) ---
    if (nbExcessFighters == 0) {
      possiblePoolSetups.push(
        toPoolSetup([
          {
            poolSize: poolSize,
            amount: totalPoolNb,
          },
        ]),
      );

      // --- CASES WITH nbPlayers = a * poolSize + b ---
    } else {
      if (nbExcessFighters > 0 && nbExcessFighters < totalPoolNb) {
        possiblePoolSetups.push(
          toPoolSetup([
            {
              poolSize: poolSize,
              amount: totalPoolNb - nbExcessFighters,
            },
            {
              poolSize: poolSize + 1,
              amount: nbExcessFighters,
            },
          ]),
        );
      }

      if (nbExcessFighters == poolSize - 1 && poolSize > 3) {
        const newSetup = toPoolSetup([
          {
            poolSize: poolSize - 1,
            amount: 1,
          },
          {
            poolSize: poolSize,
            amount: totalPoolNb,
          },
        ]);

        // --- CHECKING FOR SETUP DUPLICATE ---
        if (!possiblePoolSetups.some((setup) => poolSetupEquals(setup, newSetup))) {
          possiblePoolSetups.push(newSetup);
        }
      }
    }
  }

  possiblePoolSetups.sort((a, b) => a.nbFights - b.nbFights);

  return possiblePoolSetups;
}

export function distributeFightersInPools(fighters: Fighter[], poolSetup: PoolSetup): Pool[] {
  // --- CHECKING INPUT ---
  let poolSetupCapacity = 0;
  for (let poolGroup of poolSetup.poolGroups) {
    poolSetupCapacity += poolGroup.poolSize * poolGroup.amount;
  }

  if (fighters.length != poolSetupCapacity) {
    throw new Error("Fighter amount doesn't fit pool setup capacity");
  }

  // --- POOL LIST INITIALIZATION ---
  let pools: Pool[] = [];
  for (let poolGroup of poolSetup.poolGroups) {
    for (let i = 1; i <= poolGroup.amount; i++)
      pools.push({
        number: i,
        size: poolGroup.poolSize,
        fighters: [],
      });
  }

  // --- FIGHTERS DISTRIBUTION ---
  for (let fighter of fighters) {
    const poolFighter = toPoolFighter(fighter);

    for (let pool of pools) {
      const poolIsFull = pool.fighters.length == pool.size;
      const nbSameClubMembersInPool = countClubMembersInPool(pool, fighter.club);
      const nbPoolsWithFewerSameClubMembers = pools.filter(
        (p) => countClubMembersInPool(p, fighter.club) < nbSameClubMembersInPool,
      ).length;

      if (!poolIsFull && nbPoolsWithFewerSameClubMembers == 0) {
        pool.fighters.push(poolFighter);
        break;
      }
    }
  }

  return pools;
}

function countClubMembersInPool(pool: Pool, clubName: string): number {
  return pool.fighters.filter((poolFighter) => poolFighter.fighter.club == clubName).length;
}
