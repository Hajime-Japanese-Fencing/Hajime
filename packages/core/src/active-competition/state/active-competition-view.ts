import { createStore } from "@tanstack/store";
import type { ReadonlyStore } from "@tanstack/store";
import type { PoolId } from "../../shared/pool-id.ts";
import type { FightRecord } from "../domain/fight-record.ts";
import type { ActiveCompetitionState } from "./competition-state.ts";

export interface ActiveCompetitionView {
  readonly activeFight: FightRecord | undefined;
  readonly fights: readonly FightRecord[];
  poolFights(poolId: PoolId): readonly FightRecord[];
}

export function createActiveCompetitionView(
  state: ActiveCompetitionState & {
    store: { state: ReturnType<ActiveCompetitionState["snapshot"]> };
  },
): ReadonlyStore<ActiveCompetitionView> {
  return createStore(() => {
    const snapshot = state.store.state;

    return {
      activeFight:
        snapshot.activeFightId === null ? undefined : snapshot.fightsById[snapshot.activeFightId],
      fights: Object.values(snapshot.fightsById),
      poolFights: (poolId: PoolId) => {
        const pool = snapshot.poolsById[poolId];
        if (!pool) return [];

        return pool.fightIds
          .map((fightId) => snapshot.fightsById[fightId])
          .filter((fight): fight is FightRecord => fight !== undefined);
      },
    };
  });
}
