import { describe, it, expect } from "vite-plus/test";
import { makeCompetitionId } from "../../../shared/competition-id.ts";
import { makeFighterId } from "../../../shared/fighter-id.ts";
import type { CompetitionId } from "../../../shared/competition-id.ts";
import type { FighterEntry } from "../../../shared/fighter.ts";
import type { RosterRepositoryPort } from "../ports/roster-repository.port.ts";
import { saveRosterUseCase } from "./save-roster.use-case.ts";

class SpyRosterRepository implements RosterRepositoryPort {
  public saved: { competitionId: CompetitionId; fighters: FighterEntry[] } | null = null;

  async save(competitionId: CompetitionId, fighters: FighterEntry[]): Promise<void> {
    this.saved = { competitionId, fighters };
  }

  async load(): Promise<FighterEntry[]> {
    return [];
  }
}

function makeFighter(overrides: Partial<FighterEntry> = {}): FighterEntry {
  return {
    id: makeFighterId("fighter-1"),
    name: "Hayashi",
    club: "Tokyo Kendo Club",
    isSeeded: false,
    ...overrides,
  };
}

describe("saveRoster", () => {
  it("persists the given fighters for the competition through the repository", async () => {
    const competitionId = makeCompetitionId("competition-1");
    const fighters = [
      makeFighter({ id: makeFighterId("a") }),
      makeFighter({ id: makeFighterId("b") }),
    ];
    const repository = new SpyRosterRepository();

    await saveRosterUseCase({ rosterRepository: repository }, competitionId, fighters);

    expect(repository.saved).toEqual({ competitionId, fighters });
  });

  it("accepts an empty roster", async () => {
    const competitionId = makeCompetitionId("competition-1");
    const repository = new SpyRosterRepository();

    await saveRosterUseCase({ rosterRepository: repository }, competitionId, []);

    expect(repository.saved).toEqual({ competitionId, fighters: [] });
  });
});
