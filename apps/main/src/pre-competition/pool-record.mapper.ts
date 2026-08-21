import type { Pool } from "@hajime/core";
import type { PoolRecord } from "@hajime/core";
import { makePoolId } from "@hajime/core";
import type { FighterId } from "@hajime/core";
import {
  type FightId,
  type FightRecord,
  type PoolFight,
  type PoolId,
  type PoolTurn,
} from "@hajime/core";

export function makePoolRecord(pool: Pool, poolTurns: PoolTurn[]): PoolRecord {
  const poolId = makePoolId(pool.number);
  const fighterIds: FighterId[] = pool.fighters.map((fighter) => fighter.fighter.id);
  const fightIds: FightId[] = [];
  for (let turn of poolTurns) {
    turn.fights.map((fight: PoolFight) => fightIds.push(fight.id));
  }
  return {
    id: poolId,
    fighterIds: fighterIds,
    fightIds: fightIds,
  };
}

export function makePoolFightRecord(poolId: PoolId, fight: PoolFight): FightRecord {
  return {
    id: fight.id,
    poolId: poolId,
    redFighterId: fight.fighter1.fighter.id,
    scoreEvents: [],
    status: "waiting",
    whiteFighterId: fight.fighter2.fighter.id,
    bracketRoundId: null,
    bracketMatchIndex: null,
  };
}
