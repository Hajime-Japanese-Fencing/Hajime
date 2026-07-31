import { createStore } from "@tanstack/store";
import type { FightId } from "../../shared/fight-id.ts";
import type { PoolId } from "../../shared/pool-id.ts";
import type { BracketRoundId } from "../../shared/bracket-round-id.ts";
import type { FightRecord } from "../domain/fight-record.ts";
import type { PoolRecord } from "../domain/pool-record.ts";
import type { BracketRoundRecord } from "../domain/bracket-round-record.ts";

export interface ActiveCompetitionSnapshot {
  readonly poolsById: Readonly<Record<PoolId, PoolRecord>>;
  readonly bracketRoundsById: Readonly<Record<BracketRoundId, BracketRoundRecord>>;
  readonly fightsById: Readonly<Record<FightId, FightRecord>>;
  readonly activeFightId: FightId | null;
  readonly nextScoreEventId: number;
}

export interface ActiveCompetitionState {
  snapshot(): ActiveCompetitionSnapshot;
  replace(data: {
    pools: PoolRecord[];
    bracketRounds?: BracketRoundRecord[];
    fights: FightRecord[];
    nextScoreEventId: number;
  }): void;
  commitFight(fight: FightRecord, activeFightId: FightId | null, nextScoreEventId: number): void;
  setActiveFightId(fightId: FightId | null): void;
}

export function createCompetitionState(): ActiveCompetitionState & {
  readonly store: ReturnType<typeof createStore<ActiveCompetitionSnapshot>>;
} {
  const store = createStore<ActiveCompetitionSnapshot>({
    poolsById: {},
    bracketRoundsById: {},
    fightsById: {},
    activeFightId: null,
    nextScoreEventId: 1,
  });

  function snapshot(): ActiveCompetitionSnapshot {
    return store.state;
  }

  function replace(data: {
    pools: PoolRecord[];
    bracketRounds?: BracketRoundRecord[];
    fights: FightRecord[];
    nextScoreEventId: number;
  }): void {
    store.setState(() => ({
      poolsById: indexById(data.pools),
      bracketRoundsById: indexById(data.bracketRounds ?? []),
      fightsById: indexById(data.fights),
      activeFightId: null,
      nextScoreEventId: data.nextScoreEventId,
    }));
  }

  function commitFight(
    fight: FightRecord,
    activeFightId: FightId | null,
    nextScoreEventId: number,
  ): void {
    store.setState((state) => ({
      ...state,
      fightsById: { ...state.fightsById, [fight.id]: fight },
      activeFightId,
      nextScoreEventId,
    }));
  }

  function setActiveFightId(fightId: FightId | null): void {
    store.setState((state) => ({ ...state, activeFightId: fightId }));
  }

  return { store, snapshot, replace, commitFight, setActiveFightId };
}

function indexById<T extends { id: string | number }>(items: T[]): Record<string | number, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}
