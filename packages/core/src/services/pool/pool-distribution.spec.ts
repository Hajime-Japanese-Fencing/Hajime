import { describe, it, expect } from "vite-plus/test";
import {
  distributeFightersInPools,
} from "./pool.service.ts";
import type { PoolSetup } from "./pool-setup.interface.ts";
import {createFighter, type Fighter} from "../fighter.interface.ts";

describe("Pool Distribution - Distributes a list of fighters into pools", () => {
  it("should throws error if number of fighters do not match total pool capacity", () => {
    const fighters: Fighter[] = [
      createFighter("1", false, "club A"),
      createFighter("2", false, "club A"),
      createFighter("3", false, "club B"),
      createFighter("4", false, "club B"),
      createFighter("5", false, "club C"),
      createFighter("6", false, "club C")]

    const poolSetup: PoolSetup = {
      nbFights: 21,
      poolGroups: [{
        poolSize: 3,
        amount: 7
      }]
    }

    expect(() => distributeFightersInPools(fighters, poolSetup)).toThrow("Fighter amount doesn't fit pool setup capacity")
  })

  it("should build a pool list with the correct number of pools from the setup", () => {
    const fighters: Fighter[] = [
      createFighter("1", false, "club A"),
      createFighter("2", false, "club A"),
      createFighter("3", false, "club B"),
      createFighter("4", false, "club B"),
      createFighter("5", false, "club C"),
      createFighter("6", false, "club C")]

    const poolSetup: PoolSetup = {
      nbFights: 6,
      poolGroups: [{
        poolSize: 3,
        amount: 2
      }]
    }

    let expectedNbPools = 0
    for (let poolGroup of poolSetup.poolGroups) {
      expectedNbPools += poolGroup.amount
    }

    const pools = distributeFightersInPools(fighters, poolSetup)

    expect(pools.length).toBe(expectedNbPools)
  })

  it("should repulse all fighters of the same club if there are enough pools", () => {
    const fighters: Fighter[] = [
      createFighter("1", false, "club A"),
      createFighter("2", false, "club A"),
      createFighter("3", false, "club B"),
      createFighter("4", false, "club B"),
      createFighter("5", false, "club C"),
      createFighter("6", false, "club C")]

    const poolSetup: PoolSetup = {
      nbFights: 6,
      poolGroups: [{
          poolSize: 3,
          amount: 2
      }]
    }

    const pools = distributeFightersInPools(fighters, poolSetup)
    const nbOfAInPool1 = pools[0].fighters.filter(f => f.fighter.club == "club A").length
    const nbOfBInPool1 = pools[0].fighters.filter(f => f.fighter.club == "club B").length
    const nbOfCInPool1 = pools[0].fighters.filter(f => f.fighter.club == "club C").length
    const nbOfAInPool2 = pools[1].fighters.filter(f => f.fighter.club == "club A").length
    const nbOfBInPool2 = pools[1].fighters.filter(f => f.fighter.club == "club B").length
    const nbOfCInPool2 = pools[1].fighters.filter(f => f.fighter.club == "club C").length

    expect(nbOfAInPool1).toBe(1)
    expect(nbOfBInPool1).toBe(1)
    expect(nbOfCInPool1).toBe(1)
    expect(nbOfAInPool2).toBe(1)
    expect(nbOfBInPool2).toBe(1)
    expect(nbOfCInPool2).toBe(1)
  })

  it("should spread the maximum of same club members if not enough pools to separate them", () => {
    const fighters: Fighter[] = [
      createFighter("1", false, "club A"),
      createFighter("2", false, "club A"),
      createFighter("3", false, "club A"),
      createFighter("4", false, "club A"),
      createFighter("5", false, "club C"),
      createFighter("6", false, "club C")]

    const poolSetup: PoolSetup = {
      nbFights: 6,
      poolGroups: [{
        poolSize: 3,
        amount: 2
      }]
    }

    const pools = distributeFightersInPools(fighters, poolSetup)
    const nbOfAInPool1 = pools[0].fighters.filter(f => f.fighter.club == "club A").length
    const nbOfCInPool1 = pools[0].fighters.filter(f => f.fighter.club == "club C").length
    const nbOfAInPool2 = pools[1].fighters.filter(f => f.fighter.club == "club A").length
    const nbOfCInPool2 = pools[1].fighters.filter(f => f.fighter.club == "club C").length

    expect(nbOfAInPool1).toBe(2)
    expect(nbOfCInPool1).toBe(1)
    expect(nbOfAInPool2).toBe(2)
    expect(nbOfCInPool2).toBe(1)
  })
})