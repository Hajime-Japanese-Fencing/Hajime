import { createStore } from "@tanstack/store";
import type { ReadonlyStore } from "@tanstack/store";
import type { PoolId } from "../../shared/pool-id.ts";
import type { BracketRoundId } from "../../shared/bracket-round-id.ts";
import type { FightRecord } from "../../shared/fight-record.ts";
import type { PoolRecord } from "../../shared/pool-record.ts";
import type { BracketRoundRecord } from "../../shared/bracket-round-record.ts";
import type { ActiveCompetitionState } from "./competition-state.ts";

export interface ActiveCompetitionView {
  readonly activeFight: FightRecord | undefined;
  readonly fights: readonly FightRecord[];
  readonly pools: readonly PoolRecord[];
  readonly bracketRounds: readonly BracketRoundRecord[];
  poolFights(poolId: PoolId): readonly FightRecord[];
  bracketRoundFights(bracketRoundId: BracketRoundId): readonly FightRecord[];
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
      pools: Object.values(snapshot.poolsById),
      bracketRounds: Object.values(snapshot.bracketRoundsById),
      poolFights: (poolId: PoolId) => {
        const pool = snapshot.poolsById[poolId];
        if (!pool) return [];

        return pool.fightIds
          .map((fightId) => snapshot.fightsById[fightId])
          .filter((fight): fight is FightRecord => fight !== undefined);
      },
      bracketRoundFights: (bracketRoundId: BracketRoundId) => {
        const round = snapshot.bracketRoundsById[bracketRoundId];
        if (!round) return [];

        return round.fightIds
          .map((fightId) => snapshot.fightsById[fightId])
          .filter((fight): fight is FightRecord => fight !== undefined);
      },
    };
  });
}
