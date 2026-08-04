import { FightStatus } from "../../shared/fight-status.ts";
import { makeFightId } from "../../shared/fight-id.ts";
import { makeFighterId } from "../../shared/fighter-id.ts";
import { makePoolId } from "../../shared/pool-id.ts";
import type { FightRecord } from "../domain/fight-record.ts";
import type { PoolRecord } from "../domain/pool-record.ts";

export const poolId1 = makePoolId(1);

export const fighterRed = makeFighterId("fighter-red");
export const fighterWhite = makeFighterId("fighter-white");
export const fighterA = makeFighterId("fighter-a");
export const fighterB = makeFighterId("fighter-b");

export const fightId1 = makeFightId(1);
export const fightId2 = makeFightId(2);

export function makeFightRecord(overrides: Partial<FightRecord> = {}): FightRecord {
  return {
    id: fightId1,
    poolId: poolId1,
    bracketRoundId: null,
    bracketMatchIndex: null,
    redFighterId: fighterRed,
    whiteFighterId: fighterWhite,
    status: FightStatus.Waiting,
    scoreEvents: [],
    ...overrides,
  };
}

export function makePoolRecord(overrides: Partial<PoolRecord> = {}): PoolRecord {
  return {
    id: poolId1,
    fighterIds: [fighterRed, fighterWhite],
    fightIds: [fightId1],
    ...overrides,
  };
}
