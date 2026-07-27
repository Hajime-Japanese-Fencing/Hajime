import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import { IpponCode } from "../../shared/ippons.ts";
import { makeScoreEventId } from "../../shared/score-event-id.ts";
import type { ScoreEvent } from "../domain/score-event.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { fighterRed, fightId1, makeFightRecord } from "../__test__/fixtures.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import { removeScoreEvent } from "./remove-score-event.use-case.ts";

class SpyFightResultRecorder implements FightResultRecorder {
  constructor(private readonly events: string[]) {}

  async saveScoreEvents(_fightId: FightId, _scoreEvents: ScoreEvent[]): Promise<void> {
    this.events.push("port:save-score-events");
  }

  async updateStatus(_fightId: FightId, _status: FightStatus): Promise<void> {}
}

describe("Removing a score event", () => {
  it("should remove the selected score from the active fight and save it", async () => {
    const events: string[] = [];
    const scoreEvent = {
      id: makeScoreEventId(1),
      fighterId: fighterRed,
      type: "ippon" as const,
      code: IpponCode.Men,
      firstBlood: true,
    };
    const fight = makeFightRecord({ status: FightStatus.InProgress, scoreEvents: [scoreEvent] });
    const state = new FakeActiveCompetitionState(
      { fightsById: { [fightId1]: fight }, activeFightId: fightId1 },
      events,
    );

    await expect(
      removeScoreEvent(
        { state, saveFightResult: new SpyFightResultRecorder(events) },
        fightId1,
        scoreEvent.id,
        "ippon",
      ),
    ).resolves.toEqual({ ok: true });

    expect(state.snapshot().fightsById[fightId1].scoreEvents).toEqual([]);
    expect(events).toEqual(["state:commit-fight", "port:save-score-events"]);
  });

  it("should reject removing a penalty as a score", async () => {
    const scoreEvent = {
      id: makeScoreEventId(1),
      fighterId: fighterRed,
      type: "hansoku" as const,
      code: "Δ" as const,
      firstBlood: false,
    };
    const fight = makeFightRecord({ status: FightStatus.InProgress, scoreEvents: [scoreEvent] });
    const state = new FakeActiveCompetitionState({
      fightsById: { [fightId1]: fight },
      activeFightId: fightId1,
    });

    await expect(
      removeScoreEvent(
        { state, saveFightResult: new SpyFightResultRecorder([]) },
        fightId1,
        scoreEvent.id,
        "ippon",
      ),
    ).resolves.toEqual({ ok: false, reason: "illegal_transition" });
    expect(state.snapshot().fightsById[fightId1].scoreEvents).toEqual([scoreEvent]);
  });
});
