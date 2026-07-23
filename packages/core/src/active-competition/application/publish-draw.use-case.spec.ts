import { describe, expect, it } from "vite-plus/test";
import { makeCompetitionId, type CompetitionId } from "../../shared/competition-id.ts";
import { makeFightRecord, makePoolRecord } from "../__test__/fixtures.ts";
import type { ApplyDrawPort } from "../ports/apply-draw.port.ts";
import type {
  GeneratedFightsData,
  SaveGeneratedFightsPort,
} from "../ports/save-generated-fights.port.ts";
import { publishDraw } from "./publish-draw.use-case.ts";

class SpyApplyDrawPort implements ApplyDrawPort {
  public appliedDraw: GeneratedFightsData | undefined;

  constructor(private readonly events: string[]) {}

  applyDraw(data: GeneratedFightsData): void {
    this.events.push("apply");
    this.appliedDraw = data;
  }
}

class SpySaveGeneratedFightsPort implements SaveGeneratedFightsPort {
  public savedDraw: GeneratedFightsData | undefined;

  constructor(
    private readonly events: string[],
    private readonly error?: Error,
  ) {}

  async saveGeneratedFights(
    _competitionId: CompetitionId,
    data: GeneratedFightsData,
  ): Promise<void> {
    this.events.push("save");
    this.savedDraw = data;

    if (this.error) throw this.error;
  }
}

describe("PublishDraw UseCase", () => {
  it("applies the draw before persisting it", async () => {
    const events: string[] = [];
    const applyDraw = new SpyApplyDrawPort(events);
    const saveGeneratedFights = new SpySaveGeneratedFightsPort(events);
    const draw = { pools: [makePoolRecord()], fights: [makeFightRecord()] };

    await publishDraw({ applyDraw, saveGeneratedFights }, makeCompetitionId("competition-1"), draw);

    expect(events).toEqual(["apply", "save"]);
    expect(applyDraw.appliedDraw).toEqual(draw);
    expect(saveGeneratedFights.savedDraw).toEqual(draw);
  });

  it("keeps the applied draw when persistence fails", async () => {
    const events: string[] = [];
    const applyDraw = new SpyApplyDrawPort(events);
    const saveGeneratedFights = new SpySaveGeneratedFightsPort(events, new Error("save failed"));
    const draw = { pools: [makePoolRecord()], fights: [makeFightRecord()] };

    await expect(
      publishDraw({ applyDraw, saveGeneratedFights }, makeCompetitionId("competition-1"), draw),
    ).rejects.toThrow("save failed");

    expect(applyDraw.appliedDraw).toEqual(draw);
  });
});
