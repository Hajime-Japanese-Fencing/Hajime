import type {Fighter} from "../../fighter.interface.ts";
import type {PoolSetup} from "../setup/pool-setup.interface.ts";
import type {Pool} from "../pool.interface.ts";
import {toPoolFighter} from "./pool-fighter.interface.ts";

export function distributeFightersInPools(fighters: Fighter[], poolSetup: PoolSetup): Pool[] {

    // --- CHECKING INPUT ---
    let poolSetupCapacity = 0
    for (let poolGroup of poolSetup.poolGroups) {
        poolSetupCapacity += poolGroup.poolSize * poolGroup.amount
    }

    if (fighters.length != poolSetupCapacity) {
        throw new Error("Fighter amount doesn't fit pool setup capacity")
    }

    // --- POOL LIST INITIALIZATION ---
    let pools: Pool[] = []
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

        const poolFighter = toPoolFighter(fighter)

        for (let pool of pools) {

            const poolIsFull = pool.fighters.length == pool.size
            const nbSameClubMembersInPool = countClubMembersInPool(pool, fighter.club)
            const nbPoolsWithFewerSameClubMembers = pools.filter(p =>
                countClubMembersInPool(p, fighter.club) < nbSameClubMembersInPool
            ).length

            if (!poolIsFull && nbPoolsWithFewerSameClubMembers == 0) {
                pool.fighters.push(poolFighter)
                break
            }
        }
    }

    return pools
}

function countClubMembersInPool(pool: Pool, clubName: string): number {
    return pool.fighters.filter(poolFighter => poolFighter.fighter.club == clubName).length
}