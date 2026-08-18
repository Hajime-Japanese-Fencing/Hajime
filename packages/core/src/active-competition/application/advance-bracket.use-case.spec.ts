import { describe, expect, it } from "vite-plus/test";
import { makeBracketRoundId } from "../../shared/bracket-round-id.ts";
import { makeFighterId } from "../../shared/fighter-id.ts";
import { makeFightId } from "../../shared/fight-id.ts";
import { FightStatus } from "../../shared/fight-status.ts";
import { makeScoreEventId } from "../../shared/score-event-id.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import type { FightRecord } from "../../shared/fight-record.ts";
import type { BracketRoundRecord } from "../../shared/bracket-round-record.ts";
import { advanceBracket } from "./advance-bracket.use-case.ts";

const semiFinalId = makeBracketRoundId(1);
const finalId = makeBracketRoundId(2);

const hayashi = makeFighterId("hayashi");
const shimizu = makeFighterId("shimizu");
const yamashita = makeFighterId("yamashita");
const mori = makeFighterId("mori");

function makeFinishedSemiFinal(overrides: Partial<FightRecord> = {}): FightRecord {
  return {
    id: makeFightId("1"),
    poolId: null,
    bracketRoundId: semiFinalId,
    bracketMatchIndex: 0,
    redFighterId: hayashi,
    whiteFighterId: shimizu,
    status: FightStatus.Finished,
    scoreEvents: [
      { id: makeScoreEventId(1), fighterId: hayashi, type: "ippon", code: "M", firstBlood: true },
      { id: makeScoreEventId(2), fighterId: hayashi, type: "ippon", code: "K", firstBlood: false },
    ],
    ...overrides,
  };
}

describe("advanceBracket", () => {
  it("fills the next round's pending match but doesn't promote it while the other slot is still unknown", async () => {
    const fight = makeFinishedSemiFinal();
    const rounds: BracketRoundRecord[] = [
      {
        id: semiFinalId,
        order: 1,
        feedsRoundId: finalId,
        dependsOnRoundId: null,
        fightIds: [fight.id],
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
    const state = new FakeActiveCompetitionState({
      fightsById: { [fight.id]: fight },
      bracketRoundsById: { [semiFinalId]: rounds[0], [finalId]: rounds[1] },
    });

    const result = await advanceBracket({ state }, fight.id);

    expect(result).toEqual({ ok: true, promotedFightIds: [] });
    expect(state.snapshot().bracketRoundsById[finalId].pendingMatches).toEqual([
      { matchIndex: 0, fighter1: hayashi, fighter2: null },
    ]);
  });

  it("promotes the next round's match into a real fight once both slots are known", async () => {
    const fight = makeFinishedSemiFinal({
      bracketMatchIndex: 1,
      redFighterId: yamashita,
      whiteFighterId: mori,
      scoreEvents: [
        {
          id: makeScoreEventId(1),
          fighterId: yamashita,
          type: "ippon",
          code: "M",
          firstBlood: true,
        },
        {
          id: makeScoreEventId(2),
          fighterId: yamashita,
          type: "ippon",
          code: "K",
          firstBlood: false,
        },
      ],
    });
    const rounds: BracketRoundRecord[] = [
      {
        id: semiFinalId,
        order: 1,
        feedsRoundId: finalId,
        dependsOnRoundId: null,
        fightIds: [fight.id],
        pendingMatches: [],
      },
      {
        id: finalId,
        order: 2,
        feedsRoundId: null,
        dependsOnRoundId: semiFinalId,
        fightIds: [],
        // --- THE OTHER SEMI-FINAL (matchIndex 0) HAS ALREADY BEEN WON BY hayashi ---
        pendingMatches: [{ matchIndex: 0, fighter1: hayashi, fighter2: null }],
      },
    ];
    const state = new FakeActiveCompetitionState({
      fightsById: { [fight.id]: fight },
      bracketRoundsById: { [semiFinalId]: rounds[0], [finalId]: rounds[1] },
    });

    const result = await advanceBracket({ state }, fight.id);

    // --- THE PROMOTED FIGHT NOW GETS A RANDOM UUID (crypto.randomUUID()), SO IT CAN'T BE
    // ASSERTED AGAINST A FIXED VALUE LIKE THE OLD makeFightId("10") — READ IT BACK OFF THE
    // RESULTING STATE INSTEAD AND ASSERT EVERYTHING ELSE AGAINST THAT. ---
    const finalRound = state.snapshot().bracketRoundsById[finalId];
    expect(finalRound.pendingMatches).toEqual([]);
    expect(finalRound.fightIds).toHaveLength(1);
    const [promotedFightId] = finalRound.fightIds;

    expect(result).toEqual({ ok: true, promotedFightIds: [promotedFightId] });

    const finalFight = state.snapshot().fightsById[promotedFightId];
    expect(finalFight).toEqual({
      id: promotedFightId,
      poolId: null,
      bracketRoundId: finalId,
      bracketMatchIndex: 0,
      redFighterId: hayashi,
      whiteFighterId: yamashita,
      status: FightStatus.Waiting,
      scoreEvents: [],
    });
  });

  it("rejects a fight that isn't finished yet", async () => {
    const fight = makeFinishedSemiFinal({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({ fightsById: { [fight.id]: fight } });

    await expect(advanceBracket({ state }, fight.id)).resolves.toEqual({
      ok: false,
      reason: "not_finished",
    });
  });

  it("rejects a fight that isn't part of a bracket", async () => {
    const fight = makeFinishedSemiFinal({ bracketRoundId: null, bracketMatchIndex: null });
    const state = new FakeActiveCompetitionState({ fightsById: { [fight.id]: fight } });

    await expect(advanceBracket({ state }, fight.id)).resolves.toEqual({
      ok: false,
      reason: "not_a_bracket_fight",
    });
  });

  it("rejects a tied fight with no recorded decision", async () => {
    const fight = makeFinishedSemiFinal({ scoreEvents: [] });
    const state = new FakeActiveCompetitionState({ fightsById: { [fight.id]: fight } });

    await expect(advanceBracket({ state }, fight.id)).resolves.toEqual({
      ok: false,
      reason: "no_winner_yet",
    });
  });

  it("reports the fight as not found", async () => {
    const state = new FakeActiveCompetitionState();

    await expect(advanceBracket({ state }, makeFightId("999"))).resolves.toEqual({
      ok: false,
      reason: "fight_not_found",
    });
  });
});
