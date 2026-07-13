import { describe, it, expect } from "vite-plus/test";
import {PoolBuilder} from "../pool.interface.ts";
import {organizePoolFights} from "./pool-fight-creation.service.ts";

describe("Pool Fight Creation - organize all turns and fights in a pool", () => {
    it("should return a pool with n-1 turns for n fighters with n even", () => {
        const poolBuilder = new PoolBuilder()
        const inputPool = poolBuilder
            .createPool()
            .withSize(4)
            .toPool()

        const resultTurns = organizePoolFights(inputPool)

        expect(resultTurns.length).toBe(3)
    })

    it("should return a pool with n turns for n fighters with n odd", () => {
        const poolBuilder = new PoolBuilder()
        const inputPool = poolBuilder
            .createPool()
            .withSize(5)
            .toPool()

        const resultTurns = organizePoolFights(inputPool)

        expect(resultTurns.length).toBe(5)
    })
})