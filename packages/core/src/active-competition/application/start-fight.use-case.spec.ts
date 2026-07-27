import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { ScoreEvent } from "../domain/score-event.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { fightId1, fightId2, makeFightRecord } from "../__test__/fixtures.ts";
import type { SaveFightResultPort } from "../ports/save-fight-result.port.ts";
import { startFight } from "./start-fight.use-case.ts";

class SpySaveFightResultPort implements SaveFightResultPort {
  constructor(private readonly events: string[]) {}

  async saveScoreEvents(_fightId: FightId, _scoreEvents: ScoreEvent[]): Promise<void> {}

  async updateStatus(fightId: FightId, status: FightStatus): Promise<void> {
    this.events.push("port:update-status");
    expect(fightId).toBe(fightId1);
    expect(status).toBe(FightStatus.InProgress);
  }
}

describe("StartFight UseCase", () => {
  it("starts the selected Waiting fight, activates it, then persists its status", async () => {
    const events: string[] = [];
    const fight = makeFightRecord();
    const state = new FakeActiveCompetitionState({ fightsById: { [fightId1]: fight } }, events);

    await expect(
      startFight({ state, saveFightResult: new SpySaveFightResultPort(events) }, fightId1),
    ).resolves.toEqual({ ok: true });

    expect(state.snapshot().fightsById[fightId1].status).toBe(FightStatus.InProgress);
    expect(state.snapshot().activeFightId).toBe(fightId1);
    expect(events).toEqual(["state:commit-fight", "port:update-status"]);
  });

  it("rejects an unknown fight and a start while another fight is active", async () => {
    const events: string[] = [];
    const state = new FakeActiveCompetitionState({ activeFightId: fightId2 }, events);
    const saveFightResult = new SpySaveFightResultPort(events);

    await expect(startFight({ state, saveFightResult }, fightId1)).resolves.toEqual({
      ok: false,
      reason: "fight_not_found",
    });

    const fight = makeFightRecord();
    const activeState = new FakeActiveCompetitionState(
      { fightsById: { [fightId1]: fight }, activeFightId: fightId2 },
      events,
    );
    await expect(startFight({ state: activeState, saveFightResult }, fightId1)).resolves.toEqual({
      ok: false,
      reason: "not_active",
    });
    expect(events).toEqual([]);
  });
});
