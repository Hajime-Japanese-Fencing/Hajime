import { describe, expect, it } from "vite-plus/test";
import { makeCompetitionId, type CompetitionId } from "../../shared/competition-id.ts";
import { makeScoreEventId } from "../../shared/score-event-id.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { makeFightRecord, makePoolRecord } from "../__test__/fixtures.ts";
import type {
  CompetitionFightsData,
  LoadCompetitionFightsPort,
} from "../ports/load-competition-fights.port.ts";
import { loadCompetition } from "./load-competition.use-case.ts";

class StubLoadCompetitionFightsPort implements LoadCompetitionFightsPort {
  constructor(private readonly data: CompetitionFightsData) {}

  async load(_competitionId: CompetitionId): Promise<CompetitionFightsData> {
    return this.data;
  }
}

describe("LoadCompetition UseCase", () => {
  it("loads and atomically replaces competition data with a reset active fight and next score event id", async () => {
    const state = new FakeActiveCompetitionState();
    const fight = makeFightRecord({
      scoreEvents: [
        {
          id: makeScoreEventId(4),
          fighterId: makeFightRecord().redFighterId,
          type: "ippon",
          code: "M",
          firstBlood: true,
        },
      ],
    });
    const data = { pools: [makePoolRecord()], fights: [fight] };

    await loadCompetition(
      { state, loadCompetitionFights: new StubLoadCompetitionFightsPort(data) },
      makeCompetitionId("competition-1"),
    );

    expect(state.snapshot()).toEqual({
      poolsById: { [data.pools[0].id]: data.pools[0] },
      fightsById: { [fight.id]: fight },
      activeFightId: null,
      nextScoreEventId: 5,
    });
  });
});
