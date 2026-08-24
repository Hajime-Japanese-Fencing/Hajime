import { describe, it, expect } from "vite-plus/test";
import { makeCompetitionId } from "../../../shared/competition-id.ts";
import { makeFighterId } from "../../../shared/fighter-id.ts";
import type { CompetitionId } from "../../../shared/competition-id.ts";
import type { FighterEntry } from "../../../shared/fighter.ts";
import type { RosterRepositoryPort } from "../ports/roster-repository.port.ts";
import { loadRoster } from "./load-roster.use-case.ts";

class SpyRosterRepository implements RosterRepositoryPort {
  public loadedCompetitionId: CompetitionId | null = null;

  constructor(private readonly fightersToReturn: FighterEntry[]) {}

  async save(): Promise<void> {}

  async load(competitionId: CompetitionId): Promise<FighterEntry[]> {
    this.loadedCompetitionId = competitionId;
    return this.fightersToReturn;
  }
}

describe("loadRoster", () => {
  it("returns the fighters stored for the competition", async () => {
    const competitionId = makeCompetitionId("competition-1");
    const fighters: FighterEntry[] = [
      { id: makeFighterId("a"), name: "Hayashi", club: "Tokyo Kendo Club", isSeeded: true },
    ];
    const repository = new SpyRosterRepository(fighters);

    const result = await loadRoster({ rosterRepository: repository }, competitionId);

    expect(result).toEqual(fighters);
    expect(repository.loadedCompetitionId).toBe(competitionId);
  });

  it("returns an empty array when the competition has no roster yet", async () => {
    const competitionId = makeCompetitionId("competition-1");
    const repository = new SpyRosterRepository([]);

    const result = await loadRoster({ rosterRepository: repository }, competitionId);

    expect(result).toEqual([]);
  });
});
