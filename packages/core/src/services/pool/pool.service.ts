import type {PoolGroup} from "./pool-group.interface.ts";
import type {PoolSetup} from "./pool-setup.interface.ts";
import {factorial} from "../statistics.service.ts";

export function calculatePossiblePoolSetups(nbFighters: number): PoolSetup[] {

    if (!Number.isInteger(nbFighters)) {
        throw new Error("number of fighters must be integer")
    }

    const possiblePoolSetups: PoolSetup[] = []
    const maxPoolSize = Math.ceil(nbFighters/2)

    for (let poolSize = 3; poolSize <= maxPoolSize; poolSize ++ ) {

        // REPARTITION PARFAITE
        if (nbFighters % poolSize == 0) {

            const poolGroups: PoolGroup[] = [{
                poolSize: poolSize,
                amount: Math.floor(nbFighters / poolSize)
            }]

            const newPoolSetup: PoolSetup = {
                poolGroups: poolGroups,
                nbFights: calculateNbFightsInPool(poolGroups),
            }

            possiblePoolSetups.push(newPoolSetup)
        }
    }

    return possiblePoolSetups
}

function calculateNbFightsInPool(poolGroups: PoolGroup[]): number {
    let nbFightsTotal = 0

    for (let group of poolGroups) {
        const nbFightsInPool = factorial(group.poolSize) / (2*(factorial(group.poolSize - 2)))
        nbFightsTotal += group.amount * nbFightsInPool
    }
    return nbFightsTotal
}

