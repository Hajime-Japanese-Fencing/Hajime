import { FightStatus } from "../../shared/fight-status.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import { poolNumberOf, type PoolId } from "../../shared/pool-id.ts";
import { determineFightWinner } from "./fight/fight-winner.ts";
import type { ActiveCompetitionView } from "../state/active-competition-view.ts";

/**
 * One pool fight as printed on the export: the two fighters and, once the fight is finished,
 * its winner (see `determineFightWinner` — `null` while the fight hasn't been played or hasn't
 * been decided yet).
 */
export interface PoolExportFight {
  readonly fighter1: FighterId;
  readonly fighter2: FighterId;
  readonly winner: FighterId | null;
  readonly status: FightStatus;
}

export interface PoolExportGroup {
  readonly poolId: PoolId;
  readonly fighterIds: FighterId[];
  readonly fights: PoolExportFight[];
}

export interface PoolExport {
  readonly pools: PoolExportGroup[];
}

/**
 * Builds a printable snapshot of the pool phase's fights: one group per pool, each listing its
 * fighters and its fights with their outcome so far.
 *
 * Intentionally leaves out any ranking/standings computation (points, victories, ippon
 * difference) — nothing in `@hajime/core` computes those yet from `FightRecord`s (see
 * `RankingDetail`/`calculateFighterRanks` in `@hajime/ui`, which only sorts stats it's handed,
 * it doesn't derive them from fights). That computation belongs here once it exists; this export
 * will be extended to include it then.
 */
export function buildPoolExport(view: ActiveCompetitionView): PoolExport {
  const pools = [...view.pools]
    .sort((a, b) => poolNumberOf(a.id) - poolNumberOf(b.id))
    .map(
      (pool): PoolExportGroup => ({
        poolId: pool.id,
        fighterIds: pool.fighterIds,
        fights: view.poolFights(pool.id).map((fight) => ({
          fighter1: fight.redFighterId,
          // --- POOL FIGHTS NEVER HAVE A BYE (whiteFighterId IS ONLY EVER null FOR A BRACKET
          // FIRST-ROUND BYE, SEE FightRecord) — SAFE TO ASSERT NON-null HERE. ---
          fighter2: fight.whiteFighterId!,
          winner: fight.status === FightStatus.Finished ? determineFightWinner(fight) : null,
          status: fight.status,
        })),
      }),
    );

  return { pools };
}
