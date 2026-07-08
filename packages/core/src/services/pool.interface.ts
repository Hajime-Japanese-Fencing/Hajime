import type {PoolFighter} from "./pool/pool-fighter.interface.ts";

export interface Pool {
    number: number,
    size: number,
    fighters: PoolFighter[]
}