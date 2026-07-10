import type { Fighter } from "../../fighter.interface.ts";
import type { PoolSetup } from "../setup/pool-setup.interface.ts";
import type { Pool } from "../pool.interface.ts";
import { toPoolFighter } from "./pool-fighter.interface.ts";

export function distributeFightersInPools(fighters: Fighter[], poolSetup: PoolSetup, shouldRepulseSameClubMembers: boolean = false, shouldRepulseSeriesHead: boolean = false): Pool[] {

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
  const sortedFighters = sortFighters(fighters, true, true)

  for (let fighter of sortedFighters) {

    for (let pool of pools) {
      const poolIsFull = pool.fighters.length == pool.size;

      let poolIndex = 0

      for (let pool of pools) {

        // --- LOGICAL TESTS ---
        const poolIsFull = pool.fighters.length == pool.size

        const nbSameClubMembersInPool = countClubMembersInPool(pool, fighter.club)
        const nbPoolsWithFewerSameClubMembers = pools
          .filter(p => countClubMembersInPool(p, fighter.club) < nbSameClubMembersInPool)
          .length
        const passSameClubMembersRepulseCheck = nbPoolsWithFewerSameClubMembers == 0 || !shouldRepulseSameClubMembers

        const nbSeriesHeadsInPool = countSeriesHeadsInPool(pool)
        const nbPoolsWithFewerSeriesHeads = pools
          .filter(p => countSeriesHeadsInPool(p) < nbSeriesHeadsInPool)
          .length
        const passSeriesHeadsRepulseCheck = !fighter.isSeriesHead || nbPoolsWithFewerSeriesHeads == 0 || !shouldRepulseSeriesHead

        const isLastPool = poolIndex == pools.length

        if (!poolIsFull &&
          ((passSameClubMembersRepulseCheck && passSeriesHeadsRepulseCheck) || isLastPool)
        ) {
          pool.fighters.push(poolFighter)
          break
        }

        poolIndex += 1
      }
    }
  }

  return pools;
}

function countClubMembersInPool(pool: Pool, clubName: string): number {
  return pool.fighters.filter((poolFighter) => poolFighter.fighter.club == clubName).length;
}

function countSeriesHeadsInPool(pool: Pool): number {
  return pool.fighters.filter(poolFighter => poolFighter.fighter.isSeriesHead).length
}

function sortFighters(fighters: Fighter[], sortBySeriesHeads: boolean, sortByClub: boolean): Fighter[] {
  let headFighters: Fighter[] = []
  let regularFighters: Fighter[] = fighters

  if (sortBySeriesHeads) {
    headFighters = fighters.filter(fighter => fighter.isSeriesHead)
    regularFighters = fighters.filter(fighter => !fighter.isSeriesHead)
  }

  if (sortByClub) {
    headFighters.sort((fighter1, fighter2) => fighter1.club > fighter2.club ? 1 : -1)
    regularFighters.sort((fighter1, fighter2) => fighter1.club > fighter2.club ? 1 : -1)
  }

  return [...headFighters, ...regularFighters]
}
