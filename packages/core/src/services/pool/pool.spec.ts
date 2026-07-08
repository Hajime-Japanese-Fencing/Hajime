import { describe, it, expect } from "vite-plus/test";
import {calculateNbFightsInPool, calculatePossiblePoolSetups, poolSetupEquals} from "./pool.service.ts";
import type { PoolSetup } from "./pool-setup.interface.ts";
import type { PoolGroup } from "./pool-group.interface.ts";

describe("calculatePossiblePoolSetups", () => {
  it("return all setups (4*3, 3*4, 2*6) for 12 fighters", () => {
    const possiblePoolSetups = calculatePossiblePoolSetups(12);

    const poolSetupsForSixFighters: PoolSetup[] = [
      {
        nbFights: 12,
        poolGroups: [
          {
            poolSize: 3,
            amount: 4,
          },
        ],
      },
      {
        nbFights: 18,
        poolGroups: [
          {
            poolSize: 4,
            amount: 3,
          },
        ],
      },
      {
        nbFights: 30,
        poolGroups: [
          {
            poolSize: 6,
            amount: 2,
          },
        ],
      },
    ];

    expect(possiblePoolSetups).toStrictEqual(poolSetupsForSixFighters);
  });

  it("return all possible setups (3*3, 4*1+5*1) for 9 fighters", () => {
    const possiblePoolSetups = calculatePossiblePoolSetups(9);

    const poolSetupsForNineFighters: PoolSetup[] = [
      {
        nbFights: 9,
        poolGroups: [
          {
            poolSize: 3,
            amount: 3,
          },
        ],
      },
      {
        nbFights: 16,
        poolGroups: [
          {
            poolSize: 4,
            amount: 1,
          },
          {
            poolSize: 5,
            amount: 1,
          },
        ],
      },
    ];

    expect(possiblePoolSetups).toStrictEqual(poolSetupsForNineFighters);
  });

  it("return all possible setups for 23 fighters", () => {
    const possiblePoolSetups = calculatePossiblePoolSetups(23);

    const poolSetupsExpected: PoolSetup[] = [
      {
        nbFights: 27,
        poolGroups: [
          {
            poolSize: 3,
            amount: 5,
          },
          {
            poolSize: 4,
            amount: 2,
          },
        ],
      },
      {
        nbFights: 33,
        poolGroups: [
          {
            poolSize: 3,
            amount: 1,
          },
          {
            poolSize: 4,
            amount: 5,
          },
        ],
      },
      {
        nbFights: 42,
        poolGroups: [
          {
            poolSize: 4,
            amount: 2,
          },
          {
            poolSize: 5,
            amount: 3,
          },
        ],
      },
      {
        nbFights: 55,
        poolGroups: [
          {
            poolSize: 5,
            amount: 1,
          },
          {
            poolSize: 6,
            amount: 3,
          },
        ],
      },
      {
        nbFights: 77,
        poolGroups: [
          {
            poolSize: 7,
            amount: 1,
          },
          {
            poolSize: 8,
            amount: 2,
          },
        ],
      },
      {
        nbFights: 121,
        poolGroups: [
          {
            poolSize: 11,
            amount: 1,
          },
          {
            poolSize: 12,
            amount: 1,
          },
        ],
      },
    ];

    expect(possiblePoolSetups).toStrictEqual(poolSetupsExpected);
  });

  it("throws error if number of fighters is not an integer", () => {
    expect(() => calculatePossiblePoolSetups(6.5)).toThrow(
      "number of fighters must be a positive integer",
    );
  });

  it("throws error if number of fighters is not positive", () => {
    expect(() => calculatePossiblePoolSetups(-6)).toThrow(
      "number of fighters must be a positive integer",
    );
  });

  it("throws error if number of fighters is less than 4", () => {
    expect(() => calculatePossiblePoolSetups(3)).toThrow(
      "cannot create pools for less than 4 fighters",
    );
  });

  // it('returns pools of size between 3 and 5', () => {
  //     const possiblePoolSetups = calculatePossiblePoolSetups(50)
  //     for (let poolSetup of possiblePoolSetups) {
  //         for (let poolGroup of poolSetup.poolGroups) {
  //             expect(poolGroup.poolSize).toBeGreaterThanOrEqual(3)
  //             expect(poolGroup.poolSize).toBeLessThanOrEqual(5)
  //         }
  //     }
  // })
});

describe("calculateNbFightsInPool", () => {
  it("returns 30 for 2 pools of 6", () => {
    const poolGroups: PoolGroup[] = [
      {
        poolSize: 6,
        amount: 2,
      },
    ];

    expect(calculateNbFightsInPool(poolGroups)).toStrictEqual(30);
  });

  it("returns 16 for 1 pool of 4 and 1 pool of 5", () => {
    const poolGroups: PoolGroup[] = [
      {
        poolSize: 4,
        amount: 1,
      },
      {
        poolSize: 5,
        amount: 1,
      },
    ];

    expect(calculateNbFightsInPool(poolGroups)).toStrictEqual(16);
  });
});

describe("poolSetupEquals", () => {
  it("returns true for 2 setups containing identical groups in same order", () => {
    const setup1: PoolSetup = {
      nbFights: 1,
      poolGroups: [
        {
          poolSize: 1,
          amount: 1
        },
        {
          poolSize: 2,
          amount: 1
        },
      ]
    }
    const setup2: PoolSetup = {
      nbFights: 1,
      poolGroups: [
        {
          poolSize: 1,
          amount: 1
        },
        {
          poolSize: 2,
          amount: 1
        },
      ]
    }

    expect(poolSetupEquals(setup1, setup2)).toBe(true)
  })

  it("returns false for 2 setups containing different groups", () => {
    const setup1: PoolSetup = {
      nbFights: 1,
      poolGroups: [
        {
          poolSize: 1,
          amount: 1
        },
        {
          poolSize: 2,
          amount: 1
        },
      ]
    }
    const setup2: PoolSetup = {
      nbFights: 1,
      poolGroups: [
        {
          poolSize: 3,
          amount: 1
        },
        {
          poolSize: 2,
          amount: 1
        },
      ]
    }

    expect(poolSetupEquals(setup1, setup2)).toBe(false)
  })

  it("returns true for 2 setups containing identical groups in different order", () => {
    const setup1: PoolSetup = {
      nbFights: 1,
      poolGroups: [
        {
          poolSize: 1,
          amount: 1
        },
        {
          poolSize: 2,
          amount: 1
        },
      ]
    }
    const setup2: PoolSetup = {
      nbFights: 1,
      poolGroups: [
        {
          poolSize: 2,
          amount: 1
        },
        {
          poolSize: 1,
          amount: 1
        },
      ]
    }

    expect(poolSetupEquals(setup1, setup2)).toBe(true)
  })
})
