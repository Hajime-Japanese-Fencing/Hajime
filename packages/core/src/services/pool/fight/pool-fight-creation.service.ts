import type {Pool} from "../pool.interface.ts";
import type {PoolTurn} from "./pool-turn.interface.ts";

export function organizePoolFights(pool: Pool): PoolTurn[] {
    let poolTurns: PoolTurn[] = []

    if (pool.fighters.length % 2 == 0) {
        for (let i = 0; i < (pool.fighters.length - 1); i++) {
            poolTurns.push(
                {
                    order: 1,
                    fights: [{
                        fighter1: {fighter: {id: "1", isSeriesHead: false, club: "club A"}},
                        fighter2: {fighter: {id: "2", isSeriesHead: false, club: "club A"}},
                        turn: 1
                    },]
                }
            )
        }
    } else {
        for (let fighter of pool.fighters) {
            poolTurns.push(
                {
                    order: 1,
                    fights: [{
                        fighter1: {fighter: {id: "1", isSeriesHead: false, club: "club A"}},
                        fighter2: {fighter: {id: "2", isSeriesHead: false, club: "club A"}},
                        turn: 1
                    },]
                }
            )
        }
    }

    return poolTurns
}