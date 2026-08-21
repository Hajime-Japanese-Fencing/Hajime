import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import { makeBracketRoundId } from "../../shared/bracket-round-id.ts";
import { makeFighterId } from "../../shared/fighter-id.ts";
import { makeScoreEventId } from "../../shared/score-event-id.ts";
import type { ScoreEvent } from "../../shared/score-event.ts";
import type { BracketRoundRecord } from "../../shared/bracket-round-record.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { fightId1, makeFightRecord } from "../__test__/fixtures.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import { finishFight } from "./finish-fight.use-case.ts";

const generateId = () => "generated-fight-id";

class SpyFightResultRecorder implements FightResultRecorder {
  constructor(private readonly events: string[]) {}

  async saveScoreEvents(_fightId: FightId, _scoreEvents: ScoreEvent[]): Promise<void> {}

  async updateStatus(_fightId: FightId, _status: FightStatus): Promise<void> {
    this.events.push("port:update-status");
  }
}

describe("Finishing a fight", () => {
  it("should finish the active fight and save its status", async () => {
    const events: string[] = [];
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState(
      { fightsById: { [fightId1]: fight }, activeFightId: fightId1 },
      events,
    );

    await expect(
      finishFight(
        { state, saveFightResult: new SpyFightResultRecorder(events), generateId },
        fightId1,
      ),
    ).resolves.toEqual({ ok: true });

    expect(state.snapshot().fightsById[fightId1].status).toBe(FightStatus.Finished);
    expect(state.snapshot().activeFightId).toBeNull();
    expect(events).toEqual(["state:commit-fight", "port:update-status"]);
  });

  it("should reject a waiting fight even when it is active", async () => {
    const fight = makeFightRecord();
    const state = new FakeActiveCompetitionState({
      fightsById: { [fightId1]: fight },
      activeFightId: fightId1,
    });

    await expect(
      finishFight({ state, saveFightResult: new SpyFightResultRecorder([]), generateId }, fightId1),
    ).resolves.toEqual({
      ok: false,
      reason: "illegal_transition",
    });
  });

  it("should advance the bracket when finishing a bracket fight with a clear winner", async () => {
    const semiFinalId = makeBracketRoundId(1);
    const finalId = makeBracketRoundId(2);
    const hayashi = makeFighterId("hayashi");
    const shimizu = makeFighterId("shimizu");

    const fight = makeFightRecord({
      id: fightId1,
      poolId: null,
      bracketRoundId: semiFinalId,
      bracketMatchIndex: 0,
      redFighterId: hayashi,
      whiteFighterId: shimizu,
      status: FightStatus.InProgress,
      scoreEvents: [
        { id: makeScoreEventId(1), fighterId: hayashi, type: "ippon", code: "M", firstBlood: true },
        {
          id: makeScoreEventId(2),
          fighterId: hayashi,
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
        fightIds: [fightId1],
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
      fightsById: { [fightId1]: fight },
      bracketRoundsById: { [semiFinalId]: rounds[0], [finalId]: rounds[1] },
      activeFightId: fightId1,
    });

    await expect(
      finishFight({ state, saveFightResult: new SpyFightResultRecorder([]), generateId }, fightId1),
    ).resolves.toEqual({ ok: true });

    expect(state.snapshot().bracketRoundsById[finalId].pendingMatches).toEqual([
      { matchIndex: 0, fighter1: hayashi, fighter2: null },
    ]);
  });
});
