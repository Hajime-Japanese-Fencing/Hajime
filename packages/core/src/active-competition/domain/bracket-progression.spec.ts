import { describe, expect, it } from "vite-plus/test";
import { makeBracketRoundId } from "../../shared/bracket-round-id.ts";
import { makeFighterId } from "../../shared/fighter-id.ts";
import { makeFightId } from "../../shared/fight-id.ts";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightRecord } from "./fight-record.ts";
import type { BracketRoundRecord } from "./bracket-round-record.ts";
import { fillNextRoundSlot } from "./bracket-progression.ts";

const semiFinalId = makeBracketRoundId(1);
const finalId = makeBracketRoundId(2);
const winner = makeFighterId("winner");

function makeFight(overrides: Partial<FightRecord> = {}): FightRecord {
  return {
    id: makeFightId(1),
    poolId: null,
    bracketRoundId: semiFinalId,
    bracketMatchIndex: 0,
    redFighterId: winner,
    whiteFighterId: makeFighterId("loser"),
    status: FightStatus.Finished,
    scoreEvents: [],
    ...overrides,
  };
}

describe("fillNextRoundSlot", () => {
  it("fills fighter1 of the next round's match for an even match index", () => {
    const rounds: BracketRoundRecord[] = [
      { id: semiFinalId, order: 1, fightIds: [], pendingMatches: [] },
      {
        id: finalId,
        order: 2,
        fightIds: [],
        pendingMatches: [{ matchIndex: 0, fighter1: null, fighter2: null }],
      },
    ];

    const result = fillNextRoundSlot(rounds, makeFight({ bracketMatchIndex: 0 }), winner);

    expect(result.find((round) => round.id === finalId)?.pendingMatches).toEqual([
      { matchIndex: 0, fighter1: winner, fighter2: null },
    ]);
  });

  it("fills fighter2 of the next round's match for an odd match index", () => {
    const rounds: BracketRoundRecord[] = [
      { id: semiFinalId, order: 1, fightIds: [], pendingMatches: [] },
      {
        id: finalId,
        order: 2,
        fightIds: [],
        pendingMatches: [{ matchIndex: 0, fighter1: makeFighterId("other"), fighter2: null }],
      },
    ];

    const result = fillNextRoundSlot(rounds, makeFight({ bracketMatchIndex: 1 }), winner);

    expect(result.find((round) => round.id === finalId)?.pendingMatches).toEqual([
      { matchIndex: 0, fighter1: makeFighterId("other"), fighter2: winner },
    ]);
  });

  it("does nothing when the fight was the final (no next round)", () => {
    const rounds: BracketRoundRecord[] = [
      { id: finalId, order: 1, fightIds: [], pendingMatches: [] },
    ];

    const result = fillNextRoundSlot(
      rounds,
      makeFight({ bracketRoundId: finalId, bracketMatchIndex: 0 }),
      winner,
    );

    expect(result).toEqual(rounds);
  });

  it("does nothing for a pool fight", () => {
    const rounds: BracketRoundRecord[] = [
      { id: semiFinalId, order: 1, fightIds: [], pendingMatches: [] },
    ];

    const result = fillNextRoundSlot(
      rounds,
      makeFight({ bracketRoundId: null, bracketMatchIndex: null }),
      winner,
    );

    expect(result).toEqual(rounds);
  });
});
