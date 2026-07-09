import {describe, expect, it} from "vite-plus/test";
import {calculateNbFightsInPool, type PoolSetup, poolSetupEquals, toPoolSetup} from "./pool-setup.interface.ts";
import type {PoolGroup} from "./pool-group.interface.ts";

describe("toPoolSetup", () => {
    it("throws error if input is an empty list", () => {
        expect(() => toPoolSetup([])).toThrow("Input cannot be empty")
    })

    it("returns a pool setup containing specified pool groups as poolGroups property", () => {
        const inputPoolGroups: PoolGroup[] = [{
                poolSize: 3,
                amount: 2
            }]
        const poolSetup = toPoolSetup(inputPoolGroups)

        expect(poolSetup.poolGroups).toBe(inputPoolGroups)
    })
})

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