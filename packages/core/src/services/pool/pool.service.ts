import type {PoolGroup} from "./pool-group.interface.ts";

export function calculatePossiblePoolSetups(nbFighters: number): PoolGroup[][] {

    if (!Number.isInteger(nbFighters)) {
        throw new Error("number of fighters must be integer")
    }

    const possiblePoolSetups: PoolGroup[][] = []
    // const maxPoolSize = Math.ceil(nbFighters/2)
    const maxPoolSize = 5

    for (let poolSize = 3; poolSize <= maxPoolSize; poolSize ++ ) {

        // REPARTITION PARFAITE
        if (nbFighters % poolSize == 0) {

            const newPoolSetup: PoolGroup[] = [{
                poolSize: poolSize,
                amount: Math.floor(nbFighters / poolSize)
            }]

            possiblePoolSetups.push(newPoolSetup)
        }
    }

    return possiblePoolSetups
}