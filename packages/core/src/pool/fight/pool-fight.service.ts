import type { Pool } from "../pool.ts";
import type { PoolFight, PoolTurn } from "./pool-fight.ts";
import type { PoolFighter } from "../distribution/pool-fighter.ts";

export function organizePoolFights(pool: Pool): PoolTurn[] {
  let poolTurns: PoolTurn[] = [];

  let fighters = [...pool.fighters];
  const poolSize = pool.fighters.length;

  if (poolSize % 2 == 0) {
    const centerFighter: PoolFighter = fighters.pop()!;
    const tableSize = fighters.length;

    for (let turn = 1; turn <= tableSize; turn++) {
      let turnfights: PoolFight[] = [];

      // --- MATCHUP DISTRIBUTION ---
      // First Matchup
      turnfights.push({
        fighter1: centerFighter,
        fighter2: fighters[poolSize / 2 - 1],
      });

      // Bulk matchup distribution
      for (let j = 0; j < poolSize / 2 - 1; j++) {
        turnfights.push({
          fighter1: fighters[j],
          fighter2: fighters[tableSize - 1 - j],
        });

        // console.log(turnfights[j])
      }

      poolTurns.push({
        order: turn,
        fights: turnfights,
      });

      fighters = rotateFighters(fighters);
    }
  } else {
    for (let turn = 1; turn <= poolSize; turn++) {
      let turnfights: PoolFight[] = [];

      // --- MATCHUP DISTRIBUTION ---
      for (let j = 0; j < (poolSize - 1) / 2; j++) {
        turnfights.push({
          fighter1: fighters[j],
          fighter2: fighters[poolSize - 1 - (j + 1)],
        });

        // console.log(turnfights[j])
      }

      poolTurns.push({
        order: turn,
        fights: turnfights,
      });

      fighters = rotateFighters(fighters);
    }
  }

  return poolTurns;
}

function rotateFighters(fighters: PoolFighter[]): PoolFighter[] {
  const step = 1;

  let newFighters: PoolFighter[] = [];

  for (let i = fighters.length - step; i < fighters.length; i++) {
    newFighters.push(fighters[i]);
  }

  for (let i = 0; i < fighters.length - step; i++) {
    newFighters.push(fighters[i]);
  }

  return newFighters;
}
