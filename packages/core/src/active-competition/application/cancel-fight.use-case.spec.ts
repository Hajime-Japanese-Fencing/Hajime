import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import { IpponCode } from "../../shared/ippons.ts";
import { makeScoreEventId } from "../../shared/score-event-id.ts";
import type { ScoreEvent } from "../../shared/score-event.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { fighterRed, fightId1, makeFightRecord } from "../__test__/fixtures.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import { cancelFight } from "./cancel-fight.use-case.ts";

class SpyFightResultRecorder implements FightResultRecorder {
  savedScoreEvents: ScoreEvent[] | undefined;

  constructor(private readonly events: string[]) {}

  async saveScoreEvents(_fightId: FightId, scoreEvents: ScoreEvent[]): Promise<void> {
    this.savedScoreEvents = scoreEvents;
    this.events.push("port:save-score-events");
  }

  async updateStatus(_fightId: FightId, _status: FightStatus): Promise<void> {
    this.events.push("port:update-status");
  }
}

describe("Cancelling a fight", () => {
  it("should return the active fight to waiting, discard its score events, and save both", async () => {
    const events: string[] = [];
    const fight = makeFightRecord({
      status: FightStatus.InProgress,
      scoreEvents: [
        {
          id: makeScoreEventId(1),
          fighterId: fighterRed,
          type: "ippon",
          code: IpponCode.Men,
          firstBlood: true,
        },
      ],
    });
    const state = new FakeActiveCompetitionState(
      { fightsById: { [fightId1]: fight }, activeFightId: fightId1 },
      events,
    );
    const saveFightResult = new SpyFightResultRecorder(events);

    await expect(cancelFight({ state, saveFightResult }, fightId1)).resolves.toEqual({ ok: true });

    expect(state.snapshot().fightsById[fightId1].status).toBe(FightStatus.Waiting);
    expect(state.snapshot().fightsById[fightId1].scoreEvents).toEqual([]);
    expect(state.snapshot().activeFightId).toBeNull();
    expect(saveFightResult.savedScoreEvents).toEqual([]);
    expect(events).toEqual(["state:commit-fight", "port:update-status", "port:save-score-events"]);
  });

  it("should leave the competition unchanged when the fight is not active", async () => {
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({ fightsById: { [fightId1]: fight } });

    await expect(
      cancelFight({ state, saveFightResult: new SpyFightResultRecorder([]) }, fightId1),
    ).resolves.toEqual({
      ok: false,
      reason: "not_active",
    });
    expect(state.snapshot().fightsById[fightId1]).toEqual(fight);
  });
});
