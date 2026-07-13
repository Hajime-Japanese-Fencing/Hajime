import type {Pool} from "../pool.interface.ts";
import type {PoolTurn} from "./pool-turn.interface.ts";
import type {PoolFight} from "./pool-fight.interface.ts";

export function organizePoolFights(pool: Pool): PoolTurn[] {
    let poolTurns: PoolTurn[] = []

    const poolSize = pool.fighters.length

    if (poolSize % 2 == 0) {

        for (let turn = 1; turn <= (poolSize - 1); turn++) {

            let turnfights: PoolFight[] = []

            // --- MATCHUP DISTRIBUTION ---
            // First Matchup
            turnfights.push({
                fighter1: pool.fighters[poolSize],
                fighter2: pool.fighters[poolSize / 2],
                turn: turn
            })

            // Bulk matchup distribution
            for (let j = 1; j < (poolSize)/2; j++) {
                turnfights.push({
                    fighter1: pool.fighters[j],
                    fighter2: pool.fighters[poolSize - j],
                    turn: turn
                })
            }

            poolTurns.push(
                {
                    order: turn,
                    fights: turnfights
                }
            )

        }

    } else {

        for (let turn = 1; turn <= (poolSize); turn++) {

            let turnfights: PoolFight[] = []

            // --- MATCHUP DISTRIBUTION ---
            for (let j = 1; j < (poolSize) / 2; j++) {
                turnfights.push({
                    fighter1: pool.fighters[j],
                    fighter2: pool.fighters[poolSize - j],
                    turn: turn
                })
            }

            poolTurns.push(
                {
                    order: turn,
                    fights: turnfights
                }
            )
        }
    }

    return poolTurns
}