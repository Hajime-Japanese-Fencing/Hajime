import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { ScoreEvent } from "../domain/score-event.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { fightId1, makeFightRecord } from "../__test__/fixtures.ts";
import type { SaveFightResultPort } from "../ports/save-fight-result.port.ts";
import { cancelFight } from "./cancel-fight.use-case.ts";

class SpySaveFightResultPort implements SaveFightResultPort {
  constructor(private readonly events: string[]) {}

  async saveScoreEvents(_fightId: FightId, _scoreEvents: ScoreEvent[]): Promise<void> {}

  async updateStatus(_fightId: FightId, _status: FightStatus): Promise<void> {
    this.events.push("port:update-status");
  }
}

describe("CancelFight UseCase", () => {
  it("returns the active InProgress fight to Waiting before persisting it", async () => {
    const events: string[] = [];
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState(
      { fightsById: { [fightId1]: fight }, activeFightId: fightId1 },
      events,
    );

    await expect(
      cancelFight({ state, saveFightResult: new SpySaveFightResultPort(events) }, fightId1),
    ).resolves.toEqual({ ok: true });

    expect(state.snapshot().fightsById[fightId1].status).toBe(FightStatus.Waiting);
    expect(state.snapshot().activeFightId).toBeNull();
    expect(events).toEqual(["state:commit-fight", "port:update-status"]);
  });

  it("rejects a non-active fight without changing state", async () => {
    const fight = makeFightRecord({ status: FightStatus.InProgress });
    const state = new FakeActiveCompetitionState({ fightsById: { [fightId1]: fight } });

    await expect(
      cancelFight({ state, saveFightResult: new SpySaveFightResultPort([]) }, fightId1),
    ).resolves.toEqual({
      ok: false,
      reason: "not_active",
    });
    expect(state.snapshot().fightsById[fightId1]).toEqual(fight);
  });
});
