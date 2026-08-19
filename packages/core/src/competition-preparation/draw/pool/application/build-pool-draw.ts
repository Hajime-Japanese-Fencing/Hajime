import { makeFightId, type FightId } from "../../../../shared/fight-id.ts";
import { makePoolId } from "../../../../shared/pool-id.ts";
import { makeFighterId } from "../../../../shared/fighter-id.ts";
import { FightStatus } from "../../../../shared/fight-status.ts";
import type { IdGenerator } from "../../../../shared/id-generator.ts";
import type { FightRecord } from "../../../../shared/fight-record.ts";
import type { PoolRecord } from "../../../../shared/pool-record.ts";
import type { Pool } from "../domain/pool.ts";
import { organizePoolFights } from "../domain/fight/pool-fight.service.ts";

export interface PoolDraw {
  readonly pools: PoolRecord[];
  readonly fights: FightRecord[];
}

export function buildPoolDraw(pools: Pool[], idGenerator: IdGenerator): PoolDraw {
  const fights: FightRecord[] = [];

  const poolRecords = pools.map((pool): PoolRecord => {
    const poolId = makePoolId(pool.number);
    const fightIds: FightId[] = [];

    for (const turn of organizePoolFights(pool)) {
      for (const fight of turn.fights) {
        const id = makeFightId(idGenerator());
        fights.push({
          id,
          poolId, // ← un combat de poule porte son poolId
          bracketRoundId: null, // ← et jamais de bracketRoundId (voir FightRecord)
          bracketMatchIndex: null,
          redFighterId: makeFighterId(fight.fighter1.fighter.id),
          whiteFighterId: makeFighterId(fight.fighter2.fighter.id), // jamais null en poule
          status: FightStatus.Waiting,
          scoreEvents: [],
        });
        fightIds.push(id);
      }
    }

    return {
      id: poolId,
      fighterIds: pool.fighters.map((pf) => makeFighterId(pf.fighter.id)),
      fightIds,
    };
  });

  return { pools: poolRecords, fights };
}
