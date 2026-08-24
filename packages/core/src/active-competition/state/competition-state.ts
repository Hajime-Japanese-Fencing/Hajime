import { createStore } from "@tanstack/store";
import type { FightId } from "../../shared/fight-id.ts";
import type { PoolId } from "../../shared/pool-id.ts";
import type { BracketRoundId } from "../../shared/bracket-round-id.ts";
import type { FightRecord } from "../../shared/fight-record.ts";
import type { PoolRecord } from "../../shared/pool-record.ts";
import type { BracketRoundRecord } from "../../shared/bracket-round-record.ts";
import type { FighterEntry } from "../../shared/fighter.ts";
import type { FighterId } from "../../shared/fighter-id.ts";

export interface ActiveCompetitionSnapshot {
  readonly poolsById: Readonly<Record<PoolId, PoolRecord>>;
  readonly bracketRoundsById: Readonly<Record<BracketRoundId, BracketRoundRecord>>;
  readonly fightsById: Readonly<Record<FightId, FightRecord>>;
  readonly activeFightId: FightId | null;
  readonly nextScoreEventId: number;
  readonly fightersById: Readonly<Record<FighterId, FighterEntry>>;
}

export interface ActiveCompetitionState {
  snapshot(): ActiveCompetitionSnapshot;
  replace(data: {
    pools: PoolRecord[];
    bracketRounds?: BracketRoundRecord[];
    fights: FightRecord[];
    nextScoreEventId: number;
    fighters: FighterEntry[];
  }): void;
  commitFight(fight: FightRecord, activeFightId: FightId | null, nextScoreEventId: number): void;
  setActiveFightId(fightId: FightId | null): void;
  // --- MERGES UPDATED BRACKET ROUNDS (E.G. A ROUND'S pendingMatches OR fightIds CHANGING)
  // AND ADDS NEWLY-PROMOTED FIGHTS, AS PART OF ADVANCING A BRACKET AFTER A FIGHT FINISHES. ---
  advanceBracket(input: { bracketRounds: BracketRoundRecord[]; newFights: FightRecord[] }): void;
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
    fightersById: {},
  });

  function snapshot(): ActiveCompetitionSnapshot {
    return store.state;
  }

  function replace(data: {
    pools: PoolRecord[];
    bracketRounds?: BracketRoundRecord[];
    fights: FightRecord[];
    nextScoreEventId: number;
    fighters: FighterEntry[];
  }): void {
    store.setState(() => ({
      poolsById: indexById(data.pools),
      bracketRoundsById: indexById(data.bracketRounds ?? []),
      fightsById: indexById(data.fights),
      activeFightId: null,
      nextScoreEventId: data.nextScoreEventId,
      fightersById: indexById(data.fighters),
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

  function advanceBracket(input: {
    bracketRounds: BracketRoundRecord[];
    newFights: FightRecord[];
  }): void {
    store.setState((state) => ({
      ...state,
      bracketRoundsById: { ...state.bracketRoundsById, ...indexById(input.bracketRounds) },
      fightsById: { ...state.fightsById, ...indexById(input.newFights) },
    }));
  }

  return { store, snapshot, replace, commitFight, setActiveFightId, advanceBracket };
}

function indexById<T extends { id: string | number }>(items: T[]): Record<string | number, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}
