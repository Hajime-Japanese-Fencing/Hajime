import type {PoolGroup} from "./pool-group.interface.ts";
import type {PoolSetup} from "./pool-setup.interface.ts";
import {factorial} from "../statistics.service.ts";

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

        let poolGroups: PoolGroup[] = []

        if (nbFighters % poolSize == 0) {
            poolGroups = [{
                poolSize: poolSize,
                amount: Math.floor(nbFighters / poolSize)
            }]

        } else if (nbFighters % poolSize == 1) {
            poolGroups = [
                {
                    poolSize: poolSize,
                    amount: Math.floor(nbFighters / poolSize) - 1
                },
                {
                    poolSize: poolSize + 1,
                    amount: 1
                },
            ]

        } else {
            continue
        }

        const newPoolSetup: PoolSetup = {
            poolGroups: poolGroups,
            nbFights: calculateNbFightsInPool(poolGroups),
        }

        possiblePoolSetups.push(newPoolSetup)
    }

    return possiblePoolSetups
}

export function calculateNbFightsInPool(poolGroups: PoolGroup[]): number {
    let nbFightsTotal = 0

    for (let group of poolGroups) {
        const nbFightsInPool = factorial(group.poolSize) / (2*(factorial(group.poolSize - 2)))
        nbFightsTotal += group.amount * nbFightsInPool
    }
    return nbFightsTotal
}

