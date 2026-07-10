import { describe, it, expect } from "vite-plus/test";
import { calculatePossiblePoolSetups, distributeFightersInPools } from "./pool.service.ts";
import type { PoolSetup } from "./pool-setup.interface.ts";
import type { Fighter } from "../fighter.interface.ts";

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

describe("distributeFightersInPools", () => {
  it("throws error if number of fighters do not match total pool capacity", () => {
    const fighters: Fighter[] = [
      {
        name: "fighter",
        surname: "1",
        globalRank: 1,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "2",
        globalRank: 2,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "3",
        globalRank: 3,
        club: "club B",
      },
      {
        name: "fighter",
        surname: "4",
        globalRank: 4,
        club: "club B",
      },
      {
        name: "fighter",
        surname: "5",
        globalRank: 5,
        club: "club C",
      },
      {
        name: "fighter",
        surname: "6",
        globalRank: 6,
        club: "club C",
      },
    ];
    const poolSetup: PoolSetup = {
      nbFights: 21,
      poolGroups: [
        {
          poolSize: 3,
          amount: 7,
        },
      ],
    };

    expect(() => distributeFightersInPools(fighters, poolSetup)).toThrow(
      "Fighter amount doesn't fit pool setup capacity",
    );
  });

  it("returns a pool list which length is the sum of all entry PoolGroups amounts", () => {
    const fighters: Fighter[] = [
      {
        name: "fighter",
        surname: "1",
        globalRank: 1,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "2",
        globalRank: 2,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "3",
        globalRank: 3,
        club: "club B",
      },
      {
        name: "fighter",
        surname: "4",
        globalRank: 4,
        club: "club B",
      },
      {
        name: "fighter",
        surname: "5",
        globalRank: 5,
        club: "club C",
      },
      {
        name: "fighter",
        surname: "6",
        globalRank: 6,
        club: "club C",
      },
    ];
    const poolSetup: PoolSetup = {
      nbFights: 6,
      poolGroups: [
        {
          poolSize: 3,
          amount: 2,
        },
      ],
    };

    let expectedNbPools = 0;
    for (let poolGroup of poolSetup.poolGroups) {
      expectedNbPools += poolGroup.amount;
    }

    const pools = distributeFightersInPools(fighters, poolSetup);

    expect(pools.length).toBe(expectedNbPools);
  });

  it("separates all fighters of the same club if there are enough pools", () => {
    const fighters: Fighter[] = [
      {
        name: "fighter",
        surname: "1",
        globalRank: 1,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "2",
        globalRank: 2,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "3",
        globalRank: 3,
        club: "club B",
      },
      {
        name: "fighter",
        surname: "4",
        globalRank: 4,
        club: "club B",
      },
      {
        name: "fighter",
        surname: "5",
        globalRank: 5,
        club: "club C",
      },
      {
        name: "fighter",
        surname: "6",
        globalRank: 6,
        club: "club C",
      },
    ];
    const poolSetup: PoolSetup = {
      nbFights: 6,
      poolGroups: [
        {
          poolSize: 3,
          amount: 2,
        },
      ],
    };

    const pools = distributeFightersInPools(fighters, poolSetup);
    const nbOfAInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club A").length;
    const nbOfBInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club B").length;
    const nbOfCInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club C").length;
    const nbOfAInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club A").length;
    const nbOfBInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club B").length;
    const nbOfCInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club C").length;

    expect(nbOfAInPool1).toBe(1);
    expect(nbOfBInPool1).toBe(1);
    expect(nbOfCInPool1).toBe(1);
    expect(nbOfAInPool2).toBe(1);
    expect(nbOfBInPool2).toBe(1);
    expect(nbOfCInPool2).toBe(1);
  });

  it("spreads same club members if not enough pools to separate them", () => {
    const fighters: Fighter[] = [
      {
        name: "fighter",
        surname: "1",
        globalRank: 1,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "2",
        globalRank: 2,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "3",
        globalRank: 3,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "4",
        globalRank: 4,
        club: "club A",
      },
      {
        name: "fighter",
        surname: "5",
        globalRank: 5,
        club: "club C",
      },
      {
        name: "fighter",
        surname: "6",
        globalRank: 6,
        club: "club C",
      },
    ];
    const poolSetup: PoolSetup = {
      nbFights: 6,
      poolGroups: [
        {
          poolSize: 3,
          amount: 2,
        },
      ],
    };

    const pools = distributeFightersInPools(fighters, poolSetup);
    const nbOfAInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club A").length;
    const nbOfCInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club C").length;
    const nbOfAInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club A").length;
    const nbOfCInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club C").length;

    expect(nbOfAInPool1).toBe(2);
    expect(nbOfCInPool1).toBe(1);
    expect(nbOfAInPool2).toBe(2);
    expect(nbOfCInPool2).toBe(1);
  });
});
