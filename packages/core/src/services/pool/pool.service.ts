import type {PoolGroup} from "./pool-group.interface.ts";
import type {PoolSetup} from "./pool-setup.interface.ts";
import type {Fighter} from "../fighter.interface.ts";
import type {Pool} from "../pool.interface.ts";
import type {PoolFighter} from "./pool-fighter.interface.ts";

export function distributeFightersInPools(fighters: Fighter[], poolSetup: PoolSetup): Pool[] {
    let pools: Pool[] = []

    // --- POOL LIST INITIALIZATION ---
    for (let poolGroup of poolSetup.poolGroups) {
        for (let i= 1; i <= poolGroup.amount; i++)
        pools.push({
            number: i,
            size: poolGroup.poolSize,
            fighters: []
        })
    }

    // --- FIGHTERS DISTRIBUTION ---
    for (let fighter of fighters) {

        const poolFighter: PoolFighter = {
            fighter: fighter
        }

        for (let pool of pools) {

            const poolIsFull = pool.fighters.length >= pool.size
            const nbSameClubMembersInPool = countClubMembers(pool, fighter.club)
            const nbPoolsWithFewerSameClubMembers = pools.filter(p =>
                countClubMembers(p, fighter.club) < nbSameClubMembersInPool
            ).length
            const containsFewestClubMembers = nbPoolsWithFewerSameClubMembers == 0

            if (!poolIsFull && containsFewestClubMembers) {
                pool.fighters.push(poolFighter)
                break
            }
        }
    }

    return pools
}

function countClubMembers(pool: Pool, clubName: string): number {
    return pool.fighters.filter(poolFighter => poolFighter.fighter.club == clubName).length
}

export function calculatePossiblePoolSetups(nbFighters: number): PoolSetup[] {

    // --- TESTING FOR INCORRECT INPUTS ---
    if (!Number.isInteger(nbFighters) || nbFighters < 0) {
        throw new Error("number of fighters must be a positive integer")
    }
    if (nbFighters < 4) {
        throw new Error("cannot create pools for less than 4 fighters")
    }

    // --- CALCULATING SETUPS ---
    const possiblePoolSetups: PoolSetup[] = []
    const maxPoolSize = Math.ceil(nbFighters/2)

    for (let poolSize = 3; poolSize <= maxPoolSize; poolSize ++ ) {
        let nbExcessFighters = nbFighters % poolSize
        let totalPoolNb = Math.floor(nbFighters / poolSize)

        // --- "PERFECT" CASE (number of players = a * poolSize) ---
        if (nbExcessFighters == 0) {
            possiblePoolSetups.push(createNewPoolSetup(
                    [{
                        poolSize: poolSize,
                        amount: totalPoolNb
                    }]
            ))

        // --- CASES WITH nbPlayers = a * poolSize + b ---
        } else {
            if (nbExcessFighters > 0 && nbExcessFighters < totalPoolNb) {
                possiblePoolSetups.push(createNewPoolSetup(
                    [{
                        poolSize: poolSize,
                        amount: totalPoolNb - nbExcessFighters
                    },
                    {
                        poolSize: poolSize + 1,
                        amount: nbExcessFighters
                    }]
                ))

            }

            if (nbExcessFighters == poolSize - 1 && poolSize > 3) {
                const newSetup = createNewPoolSetup(
                    [{
                        poolSize: poolSize - 1,
                        amount: 1
                    },
                    {
                        poolSize: poolSize,
                        amount: totalPoolNb
                    }]
                )

                // --- CHECKING FOR SETUP DUPLICATE ---
                if (!possiblePoolSetups.some(setup => poolSetupEquals(setup, newSetup))) {
                    possiblePoolSetups.push(newSetup)
                }
            }
        }
    }

    possiblePoolSetups.sort((a,b) => a.nbFights - b.nbFights)

    return possiblePoolSetups
}

function createNewPoolSetup(poolGroups: PoolGroup[]): PoolSetup {
    return {
        poolGroups: poolGroups,
        nbFights: calculateNbFightsInPool(poolGroups),
    }
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