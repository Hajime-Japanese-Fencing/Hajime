import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import { IpponCode } from "../../shared/ippons.ts";
import type { ScoreEvent } from "../../shared/score-event.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { fighterRed, fighterWhite, fightId1, makeFightRecord } from "../__test__/fixtures.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import { recordHansoku, recordIppon } from "./record-score-event.use-case.ts";

class SpyFightResultRecorder implements FightResultRecorder {
  public savedScoreEvents: ScoreEvent[] | undefined;

  constructor(
    private readonly events: string[],
    private readonly error?: Error,
  ) {}

  async saveScoreEvents(_fightId: FightId, scoreEvents: ScoreEvent[]): Promise<void> {
    this.events.push("port:save-score-events");
    this.savedScoreEvents = scoreEvents;
    if (this.error) throw this.error;
  }

  async updateStatus(_fightId: FightId, _status: FightStatus): Promise<void> {}
}

describe("Recording a score event", () => {
  it("should record an ippon in the active fight and save the score", async () => {
    const events: string[] = [];
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState(
      { fightsById: { [fightId1]: fight }, activeFightId: fightId1, nextScoreEventId: 4 },
      events,
    );
    const saveFightResult = new SpyFightResultRecorder(events);

    await expect(
      recordIppon({ state, saveFightResult }, fightId1, fighterRed, IpponCode.Men),
    ).resolves.toEqual({ ok: true });

    expect(state.snapshot().nextScoreEventId).toBe(5);
    expect(state.snapshot().fightsById[fightId1].scoreEvents).toEqual([
      { id: 4, fighterId: fighterRed, type: "ippon", code: IpponCode.Men, firstBlood: true },
    ]);
    expect(saveFightResult.savedScoreEvents).toEqual(
      state.snapshot().fightsById[fightId1].scoreEvents,
    );
    expect(events).toEqual(["state:commit-fight", "port:save-score-events"]);
  });

  it("should record a hansoku in the active fight", async () => {
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({
      fightsById: { [fightId1]: fight },
      activeFightId: fightId1,
    });

    await expect(
      recordHansoku(
        { state, saveFightResult: new SpyFightResultRecorder([]) },
        fightId1,
        fighterWhite,
      ),
    ).resolves.toEqual({ ok: true });

    expect(state.snapshot().fightsById[fightId1].scoreEvents[0]).toMatchObject({
      type: "hansoku",
      fighterId: fighterWhite,
      code: "Δ",
    });
  });

  it("should reject scoring a fight that is not active", async () => {
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({ fightsById: { [fightId1]: fight } });

    await expect(
      recordIppon(
        { state, saveFightResult: new SpyFightResultRecorder([]) },
        fightId1,
        fighterRed,
        IpponCode.Men,
      ),
    ).resolves.toEqual({
      ok: false,
      reason: "not_active",
    });
    expect(state.snapshot().nextScoreEventId).toBe(1);
  });

  it("should keep the recorded score when saving fails", async () => {
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({
      fightsById: { [fightId1]: fight },
      activeFightId: fightId1,
    });

    await expect(
      recordIppon(
        { state, saveFightResult: new SpyFightResultRecorder([], new Error("save failed")) },
        fightId1,
        fighterRed,
        IpponCode.Men,
      ),
    ).rejects.toThrow("save failed");

    expect(state.snapshot().fightsById[fightId1].scoreEvents).toHaveLength(1);
  });
});
