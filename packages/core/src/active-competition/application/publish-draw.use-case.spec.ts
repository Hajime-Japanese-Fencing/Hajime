import { describe, expect, it } from "vite-plus/test";
import { makeCompetitionId, type CompetitionId } from "../../shared/competition-id.ts";
import { makeFightRecord, makePoolRecord } from "../__test__/fixtures.ts";
import type { CompetitionDraw } from "../../shared/competition-draw.ts";
import type { CompetitionDrawReceiver } from "../ports/apply-draw.port.ts";
import type { CompetitionDrawRepository } from "../ports/save-generated-fights.port.ts";
import { publishDraw } from "./publish-draw.use-case.ts";

class SpyCompetitionDrawReceiver implements CompetitionDrawReceiver {
  public receivedDraw: CompetitionDraw | undefined;

  constructor(private readonly events: string[]) {}

  applyDraw(draw: CompetitionDraw): void {
    this.events.push("receive");
    this.receivedDraw = draw;
  }
}

class SpyCompetitionDrawRepository implements CompetitionDrawRepository {
  public savedDraw: CompetitionDraw | undefined;

  constructor(
    private readonly events: string[],
    private readonly error?: Error,
  ) {}

  async save(_competitionId: CompetitionId, draw: CompetitionDraw): Promise<void> {
    this.events.push("save");
    this.savedDraw = draw;

    if (this.error) throw this.error;
  }
}

describe("Publishing a competition draw", () => {
  it("should make the draw available before saving it", async () => {
    const events: string[] = [];
    const drawReceiver = new SpyCompetitionDrawReceiver(events);
    const drawRepository = new SpyCompetitionDrawRepository(events);
    const draw = { pools: [makePoolRecord()], fights: [makeFightRecord()] };

    await publishDraw({ drawReceiver, drawRepository }, makeCompetitionId("competition-1"), draw);

    expect(events).toEqual(["receive", "save"]);
    expect(drawReceiver.receivedDraw).toEqual(draw);
    expect(drawRepository.savedDraw).toEqual(draw);
  });

  it("should keep the draw available when saving fails", async () => {
    const events: string[] = [];
    const drawReceiver = new SpyCompetitionDrawReceiver(events);
    const drawRepository = new SpyCompetitionDrawRepository(events, new Error("save failed"));
    const draw = { pools: [makePoolRecord()], fights: [makeFightRecord()] };

    await expect(
      publishDraw({ drawReceiver, drawRepository }, makeCompetitionId("competition-1"), draw),
    ).rejects.toThrow("save failed");

    expect(drawReceiver.receivedDraw).toEqual(draw);
  });
});
