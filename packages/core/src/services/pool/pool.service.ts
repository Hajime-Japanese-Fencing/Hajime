import type {PoolGroup} from "./pool-group.interface.ts";
import type {PoolSetup} from "./pool-setup.interface.ts";

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

export function poolSetupEquals(a: PoolSetup, b: PoolSetup): boolean {
    if (a.poolGroups.length !== b.poolGroups.length) return false;

    // Redondant car pas censé arriver ?
    const sortedA = [...a.poolGroups].sort((x, y) => x.poolSize - y.poolSize);
    const sortedB = [...b.poolGroups].sort((x, y) => x.poolSize - y.poolSize);

    return sortedA.every(
        (group, i) => group.poolSize === sortedB[i].poolSize
            && group.amount === sortedB[i].amount
    );
}