import { describe, it, expect } from "vite-plus/test";
import { calculatePossiblePoolSetups } from "./pool-setup.service.ts";
import type { PoolSetup } from "./pool-setup.ts";

describe("Determining pool setups", () => {
  it("should return all pool setups (4*3, 3*4, 2*6) for 12 fighters", () => {
    const possiblePoolSetups = calculatePossiblePoolSetups(12);

    const poolSetupsForSixFighters: PoolSetup[] = [
      {
        fightCount: 12,
        poolGroups: [
          {
            poolSize: 3,
            amount: 4,
          },
        ],
      },
      {
        fightCount: 18,
        poolGroups: [
          {
            poolSize: 4,
            amount: 3,
          },
        ],
      },
      {
        fightCount: 30,
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

  it("should return every valid setup for nine competitors", () => {
    const possiblePoolSetups = calculatePossiblePoolSetups(9);

    const poolSetupsForNineFighters: PoolSetup[] = [
      {
        fightCount: 9,
        poolGroups: [
          {
            poolSize: 3,
            amount: 3,
          },
        ],
      },
      {
        fightCount: 16,
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

  it("should return every valid setup for 23 competitors", () => {
    const possiblePoolSetups = calculatePossiblePoolSetups(23);

    const poolSetupsExpected: PoolSetup[] = [
      {
        fightCount: 27,
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
        fightCount: 33,
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
        fightCount: 42,
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
        fightCount: 55,
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
        fightCount: 77,
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
        fightCount: 121,
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

  it("throws error if number of fighters is less than 6", () => {
    expect(() => calculatePossiblePoolSetups(5)).toThrow(
      "cannot create pools for less than 6 fighters",
    );
  });
});
