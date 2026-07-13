import { describe, it, expect } from "vite-plus/test";
import {PoolBuilder} from "../pool.interface.ts";
import {organizePoolFights} from "./pool-fight.service.ts";
import {newPoolFighter, type PoolFighter} from "../distribution/pool-fighter.interface.ts";
import type {PoolFight} from "./pool-fight.interface.ts";

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

    it("should return a pool containing all possible matchups fo n fighters with n even", () => {
        const poolBuilder = new PoolBuilder()
        const poolSize = 4
        const inputPool = poolBuilder
            .createPool()
            .withSize(poolSize)
            .toPool()

        const fighter1 = newPoolFighter("1")
        const fighter2 = newPoolFighter("2")
        const fighter3 = newPoolFighter("3")
        const fighter4 = newPoolFighter("4")

        const expectedMatchups: PoolFighter[][][] = [
            [
                [fighter4, fighter2],
                [fighter1, fighter3],
            ],
            [
                [fighter4, fighter1],
                [fighter2, fighter3],
            ],
            [
                [fighter4, fighter3],
                [fighter1, fighter2]
            ]
        ]

        const turns = organizePoolFights(inputPool)

        for (let turn = 0; turn < turns.length; turn++) {
            for (let fight = 0; fight < turns[turn].fights.length; fight++) {
                expect(fightContainsFighter(turns[turn].fights[fight], expectedMatchups[turn][fight][0])).toBe(true)
                expect(fightContainsFighter(turns[turn].fights[fight], expectedMatchups[turn][fight][1])).toBe(true)
            }
        }
    })

    it("should return a pool containing all possible matchups fo n fighters with n odd", () => {
        const poolBuilder = new PoolBuilder()
        const poolSize = 3
        const inputPool = poolBuilder
            .createPool()
            .withSize(poolSize)
            .toPool()

        const fighter1 = newPoolFighter("1")
        const fighter2 = newPoolFighter("2")
        const fighter3 = newPoolFighter("3")

        const expectedMatchups: PoolFighter[][][] = [
            [[fighter1, fighter2]],
            [[fighter1, fighter3]],
            [[fighter3, fighter2]],
        ]

        const turns = organizePoolFights(inputPool)

        for (let turn = 0; turn < turns.length; turn++) {
            for (let fight = 0; fight < turns[turn].fights.length; fight++) {
                expect(fightContainsFighter(turns[turn].fights[fight], expectedMatchups[turn][fight][0])).toBe(true)
                expect(fightContainsFighter(turns[turn].fights[fight], expectedMatchups[turn][fight][1])).toBe(true)
            }
        }
    })
})

function fightContainsFighter(fight: PoolFight, poolFighter: PoolFighter): boolean {
    const fighter1 = fight.fighter1.fighter
    const fighter2 = fight.fighter2.fighter
    const fighter = poolFighter.fighter

    return (fighter1.id == fighter.id &&
            fighter1.isSeriesHead == fighter.isSeriesHead &&
            fighter1.club == fighter.club) ||
        (fighter2.id == fighter.id &&
            fighter2.isSeriesHead == fighter.isSeriesHead &&
            fighter2.club == fighter.club)
}