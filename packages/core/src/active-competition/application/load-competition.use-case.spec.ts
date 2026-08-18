import { describe, expect, it } from "vite-plus/test";
import { makeCompetitionId, type CompetitionId } from "../../shared/competition-id.ts";
import { makeScoreEventId } from "../../shared/score-event-id.ts";
import { FakeActiveCompetitionState } from "../__test__/fake-active-competition-state.ts";
import { makeFightRecord, makePoolRecord } from "../__test__/fixtures.ts";
import type { CompetitionDraw } from "../../shared/competition-draw.ts";
import type { CompetitionDrawLoader } from "../ports/load-competition-fights.port.ts";
import { loadCompetition } from "./load-competition.use-case.ts";

class StubCompetitionDrawLoader implements CompetitionDrawLoader {
  constructor(private readonly data: CompetitionDraw) {}

  async load(_competitionId: CompetitionId): Promise<CompetitionDraw> {
    return this.data;
  }
}

describe("Loading a competition", () => {
  it("should replace the current competition and clear the active fight", async () => {
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
      { state, loadCompetitionFights: new StubCompetitionDrawLoader(data) },
      makeCompetitionId("competition-1"),
    );

    expect(state.snapshot()).toEqual({
      poolsById: { [data.pools[0].id]: data.pools[0] },
      bracketRoundsById: {},
      fightsById: { [fight.id]: fight },
      activeFightId: null,
      nextScoreEventId: 5,
    });
  });
});
