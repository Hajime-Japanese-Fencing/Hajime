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
const thirdPlaceId = makeBracketRoundId(3);
const winner = makeFighterId("winner");
const loser = makeFighterId("loser");

function makeFight(overrides: Partial<FightRecord> = {}): FightRecord {
  return {
    id: makeFightId(1),
    poolId: null,
    bracketRoundId: semiFinalId,
    bracketMatchIndex: 0,
    redFighterId: winner,
    whiteFighterId: loser,
    status: FightStatus.Finished,
    scoreEvents: [],
    ...overrides,
  };
}

describe("fillNextRoundSlot", () => {
  it("fills fighter1 of the next round's match for an even match index", () => {
    const rounds: BracketRoundRecord[] = [
      {
        id: semiFinalId,
        order: 1,
        feedsRoundId: finalId,
        dependsOnRoundId: null,
        fightIds: [],
        pendingMatches: [],
      },
      {
        id: finalId,
        order: 2,
        feedsRoundId: null,
        dependsOnRoundId: semiFinalId,
        fightIds: [],
        pendingMatches: [{ matchIndex: 0, fighter1: null, fighter2: null }],
      },
    ];

    const result = fillNextRoundSlot(rounds, makeFight({ bracketMatchIndex: 0 }), winner, loser);

    expect(result.find((round) => round.id === finalId)?.pendingMatches).toEqual([
      { matchIndex: 0, fighter1: winner, fighter2: null },
    ]);
  });

  it("fills fighter2 of the next round's match for an odd match index", () => {
    const rounds: BracketRoundRecord[] = [
      {
        id: semiFinalId,
        order: 1,
        feedsRoundId: finalId,
        dependsOnRoundId: null,
        fightIds: [],
        pendingMatches: [],
      },
      {
        id: finalId,
        order: 2,
        feedsRoundId: null,
        dependsOnRoundId: semiFinalId,
        fightIds: [],
        pendingMatches: [{ matchIndex: 0, fighter1: makeFighterId("other"), fighter2: null }],
      },
    ];

    const result = fillNextRoundSlot(rounds, makeFight({ bracketMatchIndex: 1 }), winner, loser);

    expect(result.find((round) => round.id === finalId)?.pendingMatches).toEqual([
      { matchIndex: 0, fighter1: makeFighterId("other"), fighter2: winner },
    ]);
  });

  it("does nothing when the fight was the final (no next round)", () => {
    const rounds: BracketRoundRecord[] = [
      {
        id: finalId,
        order: 1,
        feedsRoundId: null,
        dependsOnRoundId: null,
        fightIds: [],
        pendingMatches: [],
      },
    ];

    const result = fillNextRoundSlot(
      rounds,
      makeFight({ bracketRoundId: finalId, bracketMatchIndex: 0 }),
      winner,
      loser,
    );

    expect(result).toEqual(rounds);
  });

  it("does nothing for a pool fight", () => {
    const rounds: BracketRoundRecord[] = [
      {
        id: semiFinalId,
        order: 1,
        feedsRoundId: finalId,
        dependsOnRoundId: null,
        fightIds: [],
        pendingMatches: [],
      },
    ];

    const result = fillNextRoundSlot(
      rounds,
      makeFight({ bracketRoundId: null, bracketMatchIndex: null }),
      winner,
      loser,
    );

    expect(result).toEqual(rounds);
  });

  it("also slots the loser into the third-place match when the round has a loserFeedsRoundId", () => {
    const rounds: BracketRoundRecord[] = [
      {
        id: semiFinalId,
        order: 1,
        feedsRoundId: finalId,
        loserFeedsRoundId: thirdPlaceId,
        dependsOnRoundId: null,
        fightIds: [],
        pendingMatches: [],
      },
      {
        id: finalId,
        order: 2,
        feedsRoundId: null,
        dependsOnRoundId: semiFinalId,
        fightIds: [],
        pendingMatches: [{ matchIndex: 0, fighter1: null, fighter2: null }],
      },
      {
        id: thirdPlaceId,
        order: 1.5,
        kind: "thirdPlace",
        feedsRoundId: null,
        dependsOnRoundId: semiFinalId,
        fightIds: [],
        pendingMatches: [{ matchIndex: 0, fighter1: null, fighter2: null }],
      },
    ];

    const result = fillNextRoundSlot(rounds, makeFight({ bracketMatchIndex: 0 }), winner, loser);

    expect(result.find((round) => round.id === finalId)?.pendingMatches).toEqual([
      { matchIndex: 0, fighter1: winner, fighter2: null },
    ]);
    expect(result.find((round) => round.id === thirdPlaceId)?.pendingMatches).toEqual([
      { matchIndex: 0, fighter1: loser, fighter2: null },
    ]);
  });
});
