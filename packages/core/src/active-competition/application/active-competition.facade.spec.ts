import { describe, expect, it } from "vite-plus/test";
import { makeCompetitionId, type CompetitionId } from "../../shared/competition-id.ts";
import { makeFightId } from "../../shared/fight-id.ts";
import { IpponCode } from "../../shared/ippons.ts";
import { makeScoreEventId } from "../../shared/score-event-id.ts";
import { FakeSaveFightResultAdapter } from "../__test__/fake-save-fight-result.adapter.ts";
import {
  fighterRed,
  fightId1,
  makeFightRecord,
  makePoolRecord,
  poolId1,
} from "../__test__/fixtures.ts";
import type { CompetitionDraw } from "../../shared/competition-draw.ts";
import type { CompetitionDrawLoader } from "../ports/load-competition-fights.port.ts";
import { createActiveCompetition } from "./active-competition.facade.ts";

class StubCompetitionDrawLoader implements CompetitionDrawLoader {
  constructor(private readonly data: CompetitionDraw) {}

  async load(_competitionId: CompetitionId): Promise<CompetitionDraw> {
    return this.data;
  }
}

function createFacade(data: CompetitionDraw) {
  const saveFightResult = new FakeSaveFightResultAdapter();
  const facade = createActiveCompetition({
    saveFightResult,
    loadCompetitionFights: new StubCompetitionDrawLoader(data),
  });

  return { facade, saveFightResult };
}

describe("Managing an active competition", () => {
  it("should show the competition fights by pool after loading it", async () => {
    const fight = makeFightRecord();
    const { facade } = createFacade({ pools: [makePoolRecord()], fights: [fight] });

    await facade.loadCompetition(makeCompetitionId("competition-1"));

    expect(facade.view.state.fights).toEqual([fight]);
    expect(facade.view.state.poolFights(poolId1)).toEqual([fight]);
    expect(facade.view.state.activeFight).toBeUndefined();
  });

  it("should record an ippon for the competitor on the selected side", async () => {
    const { facade, saveFightResult } = createFacade({
      pools: [makePoolRecord()],
      fights: [makeFightRecord()],
    });
    await facade.loadCompetition(makeCompetitionId("competition-1"));

    await expect(facade.openFight(fightId1)).resolves.toEqual({ ok: true });
    await expect(facade.recordIppon({ side: "RED", code: IpponCode.Men })).resolves.toEqual({
      ok: true,
    });

    expect(facade.view.state.activeFight?.scoreEvents).toEqual([
      {
        id: 1,
        fighterId: fighterRed,
        type: "ippon",
        code: IpponCode.Men,
        firstBlood: true,
      },
    ]);
    expect(saveFightResult.getScoreEvents(fightId1)).toEqual(
      facade.view.state.activeFight?.scoreEvents,
    );
  });

  it("should reject scoring or ending a fight when no fight is active", async () => {
    const { facade } = createFacade({ pools: [makePoolRecord()], fights: [makeFightRecord()] });
    await facade.loadCompetition(makeCompetitionId("competition-1"));

    await expect(facade.cancelActiveFight()).resolves.toEqual({ ok: false, reason: "not_active" });
    await expect(facade.validateActiveFight()).resolves.toEqual({
      ok: false,
      reason: "not_active",
    });
    await expect(facade.forfeitActiveFight()).resolves.toEqual({ ok: false, reason: "not_active" });
    await expect(facade.recordHansoku({ side: "WHITE" })).resolves.toEqual({
      ok: false,
      reason: "not_active",
    });
  });

  it("should reject opening an unknown or finished fight", async () => {
    const { facade } = createFacade({
      pools: [makePoolRecord()],
      fights: [makeFightRecord({ status: "finished" })],
    });
    await facade.loadCompetition(makeCompetitionId("competition-1"));

    await expect(facade.openFight(fightId1)).resolves.toEqual({
      ok: false,
      reason: "illegal_transition",
    });
    await expect(facade.openFight(makeFightId("999"))).resolves.toEqual({
      ok: false,
      reason: "fight_not_found",
    });
  });

  it("should keep a penalty when removing it as a score", async () => {
    const { facade } = createFacade({ pools: [makePoolRecord()], fights: [makeFightRecord()] });
    await facade.loadCompetition(makeCompetitionId("competition-1"));
    await facade.openFight(fightId1);
    await facade.recordHansoku({ side: "WHITE" });

    await expect(
      facade.removeScoreEvent({ scoreEventId: makeScoreEventId(1), type: "ippon" }),
    ).resolves.toEqual({ ok: false, reason: "illegal_transition" });
    expect(facade.view.state.activeFight?.scoreEvents).toHaveLength(1);
  });

  it("should replace the current competition with a published draw", async () => {
    const { facade } = createFacade({ pools: [makePoolRecord()], fights: [makeFightRecord()] });
    await facade.loadCompetition(makeCompetitionId("competition-1"));
    await facade.openFight(fightId1);
    const drawnFight = makeFightRecord({
      scoreEvents: [
        {
          id: makeScoreEventId(5),
          fighterId: fighterRed,
          type: "ippon",
          code: IpponCode.Men,
          firstBlood: true,
        },
      ],
    });

    facade.applyDraw({ pools: [makePoolRecord()], fights: [drawnFight] });

    expect(facade.view.state.activeFight).toBeUndefined();
    await facade.openFight(fightId1);
    await facade.recordIppon({ side: "RED", code: IpponCode.Kote });
    expect(facade.view.state.activeFight?.scoreEvents[1].id).toBe(6);
  });
});
