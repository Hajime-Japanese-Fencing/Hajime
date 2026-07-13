import { describe, it, expect } from "vite-plus/test";
import {PoolBuilder} from "../pool.interface.ts";
import {organizePoolFights} from "./pool-fight-creation.service.ts";

describe("Pool Fight Creation - organize all turns and fights in a pool", () => {
    it("should return a pool with n-1 turns for n fighters with n even", () => {
        const poolBuilder = new PoolBuilder()
        const poolSize = 4
        const inputPool = poolBuilder
            .createPool()
            .withSize(poolSize)
            .toPool()

        const resultTurns = organizePoolFights(inputPool)

        expect(resultTurns.length).toBe(poolSize-1)
    })

    it("should return a pool with n turns for n fighters with n odd", () => {
        const poolBuilder = new PoolBuilder()
        const poolSize = 5
        const inputPool = poolBuilder
            .createPool()
            .withSize(poolSize)
            .toPool()

        const resultTurns = organizePoolFights(inputPool)

        expect(resultTurns.length).toBe(poolSize)
    })

    it("should return a pool with turns of n/2 fights each for n fighters with n even", () => {
        const poolBuilder = new PoolBuilder()
        const poolSize = 4
        const inputPool = poolBuilder
            .createPool()
            .withSize(poolSize)
            .toPool()

        const resultTurns = organizePoolFights(inputPool)

        for (let turn = 0; turn < poolSize-1; turn ++) {
            console.log(resultTurns[turn].fights)
            expect(resultTurns[turn].fights.length).toBe(poolSize / 2)
        }
    })

    it("should return a pool with turns of n-1/2 fights each for n fighters with n odd", () => {
        const poolBuilder = new PoolBuilder()
        const poolSize = 5
        const inputPool = poolBuilder
            .createPool()
            .withSize(poolSize)
            .toPool()

        const resultTurns = organizePoolFights(inputPool)

        for (let turn = 0; turn < poolSize; turn ++) {
            expect(resultTurns[turn].fights.length).toBe((poolSize-1) / 2)
        }
    })
})