import type { FighterEntry } from "../../../../../shared/fighter.ts";
import type { PoolSetup } from "../setup/pool-setup.ts";
import type { Pool } from "../pool.ts";
import { toPoolFighter } from "./pool-fighter.ts";

export function distributeFightersInPools(
  fighters: FighterEntry[],
  poolSetup: PoolSetup,
  randomize: (entries: FighterEntry[]) => FighterEntry[] = (x) => x,
  shouldSeparateClubMembers: boolean = false,
  shouldSeparateSeededCompetitors: boolean = false,
): Pool[] {
  const poolSetupCapacity = poolSetup.poolGroups.reduce(
    (total, group) => total + group.amount * group.poolSize,
    0,
  );
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
  const sortedFighters = sortFighters(
    randomize(fighters),
    shouldSeparateSeededCompetitors,
    shouldSeparateClubMembers,
  );

  for (let fighter of sortedFighters) {
    const poolFighter = toPoolFighter(fighter);

    let poolIndex = 0;
    for (let pool of pools) {
      // --- LOGICAL TESTS ---
      const poolIsFull = pool.fighters.length == pool.size;
      const isLastPool = poolIndex == pools.length;

      // Same Club Members Check
      const nbSameClubMembersInPool = countClubMembersInPool(pool, fighter.club);
      const nbPoolsWithFewerSameClubMembers = pools.filter(
        (p) => countClubMembersInPool(p, fighter.club) < nbSameClubMembersInPool,
      ).length;
      const canPlaceClubMember = nbPoolsWithFewerSameClubMembers == 0 || !shouldSeparateClubMembers;

      // Series Heads Check
      const nbSeededCompetitorsInPool = countSeededCompetitorsInPool(pool);
      const nbPoolsWithFewerSeededCompetitors = pools.filter(
        (p) => countSeededCompetitorsInPool(p) < nbSeededCompetitorsInPool,
      ).length;
      const canPlaceSeededCompetitor =
        !fighter.isSeeded ||
        nbPoolsWithFewerSeededCompetitors == 0 ||
        !shouldSeparateSeededCompetitors;

      if (!poolIsFull && ((canPlaceClubMember && canPlaceSeededCompetitor) || isLastPool)) {
        pool.fighters.push(poolFighter);
        break;
      }

      poolIndex += 1;
    }
  }

  return pools;
}

function countClubMembersInPool(pool: Pool, clubName: string): number {
  return pool.fighters.filter((poolFighter) => poolFighter.fighter.club == clubName).length;
}

function countSeededCompetitorsInPool(pool: Pool): number {
  return pool.fighters.filter((poolFighter) => poolFighter.fighter.isSeeded).length;
}

function sortFighters(
  fighters: FighterEntry[],
  sortBySeededCompetitors: boolean,
  sortByClub: boolean,
): FighterEntry[] {
  let headFighters: FighterEntry[] = [];
  let regularFighters: FighterEntry[] = fighters;

  if (sortBySeededCompetitors) {
    headFighters = fighters.filter((fighter) => fighter.isSeeded);
    regularFighters = fighters.filter((fighter) => !fighter.isSeeded);
  }

  if (sortByClub) {
    headFighters.sort((fighter1, fighter2) => (fighter1.club > fighter2.club ? 1 : -1));
    regularFighters.sort((fighter1, fighter2) => (fighter1.club > fighter2.club ? 1 : -1));
  }

  return [...headFighters, ...regularFighters];
}
