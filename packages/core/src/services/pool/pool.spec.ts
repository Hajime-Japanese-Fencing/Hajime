import { describe, it, expect } from 'vitest'
import {calculateNbFightsInPool, calculatePossiblePoolSetups} from "./pool.service.ts";
import type {PoolSetup} from "./pool-setup.interface.ts";
import type {PoolGroup} from "./pool-group.interface.ts";

describe('calculatePossiblePoolSetups', () => {
    it('return all setups (4*3, 3*4, 2*6) for 12 fighters', () => {
        const possiblePoolSetups = calculatePossiblePoolSetups(12)

        console.log(possiblePoolSetups)

        const poolSetupsForSixFighters: PoolSetup[] = [
            {
                nbFights: 12,
                poolGroups: [{
                    poolSize: 3,
                    amount: 4,
                }]
            },
            {
                nbFights: 18,
                poolGroups: [{
                    poolSize: 4,
                    amount: 3,
                }]
            },
            {
                nbFights: 30,
                poolGroups: [{
                    poolSize: 6,
                    amount: 2,
                }]
            },
        ]

        expect(possiblePoolSetups).toStrictEqual(poolSetupsForSixFighters)
    })

    it('return all possible setups (3*3, 4*1+5*1) for 9 fighters', () => {
        const possiblePoolSetups = calculatePossiblePoolSetups(9)

        console.log(possiblePoolSetups)

        const poolSetupsForNineFighters: PoolSetup[] = [
            {
                nbFights: 9,
                poolGroups: [{
                    poolSize: 3,
                    amount: 3,
                }]
            },
            {
                nbFights: 16,
                poolGroups: [{
                    poolSize: 4,
                    amount: 1,
                },
                {
                    poolSize: 5,
                    amount: 1,
                }]
            },
        ]

        expect(possiblePoolSetups).toStrictEqual(poolSetupsForNineFighters)
    })

    it('throws error if number of fighters is not an integer', () => {
        expect(() => calculatePossiblePoolSetups(6.5))
            .toThrow('number of fighters must be a positive integer')
    })

    it('throws error if number of fighters is not positive', () => {
        expect(() => calculatePossiblePoolSetups(-6))
            .toThrow('number of fighters must be a positive integer')
    })

    it('throws error if number of fighters is less than 4', () => {
        expect(() => calculatePossiblePoolSetups(3))
            .toThrow('cannot create pools for less than 4 fighters')
    })



    // it('returns pools of size between 3 and 5', () => {
    //     const possiblePoolSetups = calculatePossiblePoolSetups(50)
    //     for (let poolSetup of possiblePoolSetups) {
    //         for (let poolGroup of poolSetup.poolGroups) {
    //             expect(poolGroup.poolSize).toBeGreaterThanOrEqual(3)
    //             expect(poolGroup.poolSize).toBeLessThanOrEqual(5)
    //         }
    //     }
    // })
})

describe('calculateNbFightsInPool', () => {
    it('returns 30 for 2 pools of 6', () => {

        const poolGroups: PoolGroup[] = [
            {
                poolSize: 6,
                amount: 2,
            }
        ]

        expect(calculateNbFightsInPool(poolGroups)).toStrictEqual(30)
    })

    it('returns 16 for 1 pool of 4 and 1 pool of 5', () => {

        const poolGroups: PoolGroup[] = [
            {
                poolSize: 4,
                amount: 1,
            },
            {
                poolSize: 5,
                amount: 1,
            }
        ]

        expect(calculateNbFightsInPool(poolGroups)).toStrictEqual(16)
    })

})