import { describe, it, expect } from 'vitest'
import {calculatePossiblePoolSetups} from "./pool.service.ts";
import type {PoolGroup} from "./pool-group.interface.ts";

describe('calculatePossiblePoolSetups', () => {
    it('find all perfect possible pool repartitions', () => {
        const possiblePoolSetups = calculatePossiblePoolSetups(12)

        const poolSetupsForSixFighters: PoolGroup[][] = [
            [
                {
                    poolSize: 3,
                    amount: 4,
                }
            ],
            [
                {
                    poolSize: 4,
                    amount: 3,
                }
            ]]

        expect(possiblePoolSetups).toStrictEqual(poolSetupsForSixFighters)
    })

    it('throws error if number of fighters is not an integer', () => {
        expect(() => calculatePossiblePoolSetups(6.5))
            .toThrow('number of fighters must be integer')
    })

    it('returns pools of size between 3 and 5', () => {
        const possiblePoolSetups = calculatePossiblePoolSetups(50)
        for (let poolSetup of possiblePoolSetups) {
            for (let poolGroup of poolSetup) {
                expect(poolGroup.poolSize).toBeGreaterThanOrEqual(3)
                expect(poolGroup.poolSize).toBeLessThanOrEqual(5)
            }
        }
    })
})