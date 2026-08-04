import type {
  ActiveCompetitionSnapshot,
  ActiveCompetitionState,
} from "../state/competition-state.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { FightRecord } from "../domain/fight-record.ts";
import type { PoolRecord } from "../domain/pool-record.ts";
import type { BracketRoundRecord } from "../domain/bracket-round-record.ts";

export class FakeActiveCompetitionState implements ActiveCompetitionState {
  private state: ActiveCompetitionSnapshot;

  constructor(
    initial: Partial<ActiveCompetitionSnapshot> = {},
    private readonly events: string[] = [],
  ) {
    this.state = {
      poolsById: {},
      bracketRoundsById: {},
      fightsById: {},
      activeFightId: null,
      nextScoreEventId: 1,
      nextFightId: 1,
      ...initial,
    };
  }

  snapshot(): ActiveCompetitionSnapshot {
    return this.state;
  }

  replace(data: {
    pools: PoolRecord[];
    bracketRounds?: BracketRoundRecord[];
    fights: FightRecord[];
    nextScoreEventId: number;
    nextFightId: number;
  }): void {
    this.events.push("state:replace");
    this.state = {
      poolsById: toRecord(data.pools),
      bracketRoundsById: toRecord(data.bracketRounds ?? []),
      fightsById: toRecord(data.fights),
      activeFightId: null,
      nextScoreEventId: data.nextScoreEventId,
      nextFightId: data.nextFightId,
    };
  }

  commitFight(fight: FightRecord, activeFightId: FightId | null, nextScoreEventId: number): void {
    this.events.push("state:commit-fight");
    this.state = {
      ...this.state,
      fightsById: { ...this.state.fightsById, [fight.id]: fight },
      activeFightId,
      nextScoreEventId,
    };
  }

  setActiveFightId(fightId: FightId | null): void {
    this.events.push("state:set-active-fight");
    this.state = { ...this.state, activeFightId: fightId };
  }

  advanceBracket(input: {
    bracketRounds: BracketRoundRecord[];
    newFights: FightRecord[];
    nextFightId: number;
  }): void {
    this.events.push("state:advance-bracket");
    this.state = {
      ...this.state,
      bracketRoundsById: { ...this.state.bracketRoundsById, ...toRecord(input.bracketRounds) },
      fightsById: { ...this.state.fightsById, ...toRecord(input.newFights) },
      nextFightId: input.nextFightId,
    };
  }
}

function toRecord<T extends { id: string | number }>(items: T[]): Record<string | number, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}
