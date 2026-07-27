import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { ScoreEvent } from "../domain/score-event.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { fightId1, makeFightRecord } from "../__test__/fixtures.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import { finishFight } from "./finish-fight.use-case.ts";

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
      finishFight({ state, saveFightResult: new SpyFightResultRecorder(events) }, fightId1),
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
      finishFight({ state, saveFightResult: new SpyFightResultRecorder([]) }, fightId1),
    ).resolves.toEqual({
      ok: false,
      reason: "illegal_transition",
    });
  });
});
