import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import { IpponCode } from "../../shared/ippons.ts";
import type { ScoreEvent } from "../domain/score-event.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { fighterRed, fighterWhite, fightId1, makeFightRecord } from "../__test__/fixtures.ts";
import type { SaveFightResultPort } from "../ports/save-fight-result.port.ts";
import { recordHansoku, recordIppon } from "./record-score-event.use-case.ts";

class SpySaveFightResultPort implements SaveFightResultPort {
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

describe("RecordScoreEvent UseCase", () => {
  it("records an ippon in the active fight before persisting its score events", async () => {
    const events: string[] = [];
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState(
      { fightsById: { [fightId1]: fight }, activeFightId: fightId1, nextScoreEventId: 4 },
      events,
    );
    const saveFightResult = new SpySaveFightResultPort(events);

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

  it("records a hansoku in the active fight", async () => {
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({
      fightsById: { [fightId1]: fight },
      activeFightId: fightId1,
    });

    await expect(
      recordHansoku(
        { state, saveFightResult: new SpySaveFightResultPort([]) },
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

  it("rejects a non-active fight without allocating a score event id", async () => {
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({ fightsById: { [fightId1]: fight } });

    await expect(
      recordIppon(
        { state, saveFightResult: new SpySaveFightResultPort([]) },
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

  it("keeps the optimistic state change when score persistence fails", async () => {
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({
      fightsById: { [fightId1]: fight },
      activeFightId: fightId1,
    });

    await expect(
      recordIppon(
        { state, saveFightResult: new SpySaveFightResultPort([], new Error("save failed")) },
        fightId1,
        fighterRed,
        IpponCode.Men,
      ),
    ).rejects.toThrow("save failed");

    expect(state.snapshot().fightsById[fightId1].scoreEvents).toHaveLength(1);
  });
});
