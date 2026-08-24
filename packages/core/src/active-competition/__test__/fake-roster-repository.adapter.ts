import type { RosterRepositoryPort } from "../../competition-preparation/roster/index.ts";
import type { CompetitionId } from "../../shared/competition-id.ts";
import type { FighterEntry } from "../../shared/fighter.ts";

export class FakeRosterRepository implements RosterRepositoryPort {
  constructor(private fighters: FighterEntry[] = []) {}

  async save(_competitionId: CompetitionId, fighters: FighterEntry[]): Promise<void> {
    this.fighters = fighters;
  }

  async load(_competitionId: CompetitionId): Promise<FighterEntry[]> {
    return this.fighters;
  }
}
