import { type PoolSetup, poolSetupEquals, toPoolSetup } from "./pool-setup.ts";

export function calculatePossiblePoolSetups(nbFighters: number): PoolSetup[] {
  // --- TESTING FOR INCORRECT INPUTS ---
  if (!Number.isInteger(nbFighters) || nbFighters < 0) {
    throw new Error("number of fighters must be a positive integer");
  }
  if (nbFighters < 6) {
    throw new Error("cannot create pools for less than 6 fighters");
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

      // --- CASES WITH nbPlayers = a * poolSize +/- b ---
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
