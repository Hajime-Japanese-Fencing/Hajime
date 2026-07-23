import { describe, it, expect } from "vite-plus/test";
import { distributeFightersInPools } from "./pool-distribution.service.ts";
import type { PoolSetup } from "../setup/pool-setup.interface.ts";
import { poolFighterEntryFactory } from "../__test__/factories.ts";
import type { FighterEntry } from "../../fighter.ts";

describe("Pool Distribution - Distributes a list of fighters into pools", () => {
  it("should throws error if number of fighters do not match total pool capacity", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", club: "club A" }),
      poolFighterEntryFactory({ id: "2", club: "club A" }),
      poolFighterEntryFactory({ id: "3", club: "club B" }),
      poolFighterEntryFactory({ id: "4", club: "club B" }),
      poolFighterEntryFactory({ id: "5", club: "club C" }),
      poolFighterEntryFactory({ id: "6", club: "club C" }),
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

  it("should build a pool list with the correct number of pools from the setup", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", isSeriesHead: false, club: "club A" }),
      poolFighterEntryFactory({ id: "2", isSeriesHead: false, club: "club A" }),
      poolFighterEntryFactory({ id: "3", isSeriesHead: false, club: "club B" }),
      poolFighterEntryFactory({ id: "4", isSeriesHead: false, club: "club B" }),
      poolFighterEntryFactory({ id: "5", isSeriesHead: false, club: "club C" }),
      poolFighterEntryFactory({ id: "6", isSeriesHead: false, club: "club C" }),
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

  it("should repulse all fighters of the same club if there are enough pools and the option is selected", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", club: "club A" }),
      poolFighterEntryFactory({ id: "2", club: "club A" }),
      poolFighterEntryFactory({ id: "3", club: "club B" }),
      poolFighterEntryFactory({ id: "4", club: "club B" }),
      poolFighterEntryFactory({ id: "5", club: "club C" }),
      poolFighterEntryFactory({ id: "6", club: "club C" }),
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

    const pools = distributeFightersInPools(fighters, poolSetup, true);
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

  it("should spread the maximum of same club members if not enough pools to separate them and the option is selected", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", club: "club A" }),
      poolFighterEntryFactory({ id: "2", club: "club A" }),
      poolFighterEntryFactory({ id: "3", club: "club A" }),
      poolFighterEntryFactory({ id: "4", club: "club A" }),
      poolFighterEntryFactory({ id: "5", club: "club C" }),
      poolFighterEntryFactory({ id: "6", club: "club C" }),
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

    const pools = distributeFightersInPools(fighters, poolSetup, true);
    const nbOfAInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club A").length;
    const nbOfCInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club C").length;
    const nbOfAInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club A").length;
    const nbOfCInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club C").length;

    expect(nbOfAInPool1).toBe(2);
    expect(nbOfCInPool1).toBe(1);
    expect(nbOfAInPool2).toBe(2);
    expect(nbOfCInPool2).toBe(1);
  });

  it("should not repulse fighters of the same club if the option is not selected", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", club: "club A" }),
      poolFighterEntryFactory({ id: "2", club: "club A" }),
      poolFighterEntryFactory({ id: "3", club: "club B" }),
      poolFighterEntryFactory({ id: "4", club: "club B" }),
      poolFighterEntryFactory({ id: "5", club: "club C" }),
      poolFighterEntryFactory({ id: "6", club: "club C" }),
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

    expect(nbOfAInPool1).toBe(2);
    expect(nbOfBInPool1).toBe(1);
    expect(nbOfCInPool1).toBe(0);
    expect(nbOfAInPool2).toBe(0);
    expect(nbOfBInPool2).toBe(1);
    expect(nbOfCInPool2).toBe(2);
  });

  it("should repulse series heads if there are enough pools and the option is selected", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", isSeriesHead: true, club: "club A" }),
      poolFighterEntryFactory({ id: "2", club: "club A" }),
      poolFighterEntryFactory({ id: "3", isSeriesHead: true, club: "club B" }),
      poolFighterEntryFactory({ id: "4", club: "club B" }),
      poolFighterEntryFactory({ id: "5", club: "club C" }),
      poolFighterEntryFactory({ id: "6", club: "club C" }),
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

    const pools = distributeFightersInPools(fighters, poolSetup, false, true);
    const nbOfSeriesHeadsInPool1 = pools[0].fighters.filter((f) => f.fighter.isSeriesHead).length;
    const nbOfSeriesHeadsInPool2 = pools[1].fighters.filter((f) => f.fighter.isSeriesHead).length;

    expect(nbOfSeriesHeadsInPool1).toBe(1);
    expect(nbOfSeriesHeadsInPool2).toBe(1);
  });

  it("should spread the maximum of series heads if there are not enough pools to separate them and the option is selected", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", isSeriesHead: true, club: "club A" }),
      poolFighterEntryFactory({ id: "2", isSeriesHead: true, club: "club A" }),
      poolFighterEntryFactory({ id: "3", isSeriesHead: true, club: "club B" }),
      poolFighterEntryFactory({ id: "4", isSeriesHead: true, club: "club B" }),
      poolFighterEntryFactory({ id: "5", club: "club C" }),
      poolFighterEntryFactory({ id: "6", club: "club C" }),
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

    const pools = distributeFightersInPools(fighters, poolSetup, false, true);
    const nbOfSeriesHeadsInPool1 = pools[0].fighters.filter((f) => f.fighter.isSeriesHead).length;
    const nbOfSeriesHeadsInPool2 = pools[1].fighters.filter((f) => f.fighter.isSeriesHead).length;

    expect(nbOfSeriesHeadsInPool1).toBe(2);
    expect(nbOfSeriesHeadsInPool2).toBe(2);
  });

  it("should not repulse series heads if the option is not selected", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", isSeriesHead: true, club: "club A" }),
      poolFighterEntryFactory({ id: "2", isSeriesHead: true, club: "club A" }),
      poolFighterEntryFactory({ id: "3", isSeriesHead: true, club: "club B" }),
      poolFighterEntryFactory({ id: "4", club: "club B" }),
      poolFighterEntryFactory({ id: "5", club: "club C" }),
      poolFighterEntryFactory({ id: "6", club: "club C" }),
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
    const nbOfSeriesHeadsInPool1 = pools[0].fighters.filter((f) => f.fighter.isSeriesHead).length;
    const nbOfSeriesHeadsInPool2 = pools[1].fighters.filter((f) => f.fighter.isSeriesHead).length;

    expect(nbOfSeriesHeadsInPool1).toBe(3);
    expect(nbOfSeriesHeadsInPool2).toBe(0);
  });

  it("should repulse along both criterias when possible", () => {
    const fighters: FighterEntry[] = [
      poolFighterEntryFactory({ id: "1", club: "club A" }),
      poolFighterEntryFactory({ id: "2", isSeriesHead: true, club: "club A" }),
      poolFighterEntryFactory({ id: "3", club: "club B" }),
      poolFighterEntryFactory({ id: "4", isSeriesHead: true, club: "club B" }),
      poolFighterEntryFactory({ id: "5", club: "club C" }),
      poolFighterEntryFactory({ id: "6", club: "club C" }),
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

    const pools = distributeFightersInPools(fighters, poolSetup, true, true);

    const nbOfSeriesHeadsInPool1 = pools[0].fighters.filter((f) => f.fighter.isSeriesHead).length;
    const nbOfSeriesHeadsInPool2 = pools[1].fighters.filter((f) => f.fighter.isSeriesHead).length;

    const nbOfAInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club A").length;
    const nbOfBInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club B").length;
    const nbOfCInPool1 = pools[0].fighters.filter((f) => f.fighter.club == "club C").length;
    const nbOfAInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club A").length;
    const nbOfBInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club B").length;
    const nbOfCInPool2 = pools[1].fighters.filter((f) => f.fighter.club == "club C").length;

    expect(nbOfSeriesHeadsInPool1).toBe(1);
    expect(nbOfSeriesHeadsInPool2).toBe(1);
    expect(nbOfAInPool1).toBe(1);
    expect(nbOfBInPool1).toBe(1);
    expect(nbOfCInPool1).toBe(1);
    expect(nbOfAInPool2).toBe(1);
    expect(nbOfBInPool2).toBe(1);
    expect(nbOfCInPool2).toBe(1);
  });
});
