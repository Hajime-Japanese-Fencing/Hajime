import { describe, it, expect } from "vite-plus/test";
import { calculatePossiblePoolSetups } from "./pool-setup.service.ts";
import type { PoolSetup } from "./pool-setup.interface.ts";

describe("Pool Setup - Determine possible pool setups", () => {
  it("should return all pool setups (4*3, 3*4, 2*6) for 12 fighters", () => {
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

  it("throws error if number of fighters is less than 6", () => {
    expect(() => calculatePossiblePoolSetups(5)).toThrow(
      "cannot create pools for less than 6 fighters",
    );
  });
});
