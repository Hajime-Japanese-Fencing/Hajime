import type { RosterRepositoryPort, CompetitionId, FighterEntry } from "@hajime/core";
import { db, type FighterRecord } from "../../../bootstrap/container/db.ts";
import { makeFighterId } from "@hajime/core";

export class BrowserRosterAdapter implements RosterRepositoryPort {
  async save(competitionId: CompetitionId, fighters: FighterEntry[]): Promise<void> {
    await db.rosters.put({ competitionId, fighters: fighters.map(toFighterRecord) });
  }
  async load(competitionId: CompetitionId): Promise<FighterEntry[]> {
    const record = await db.rosters.get(competitionId);
    return record ? record.fighters.map(toFighterEntry) : [];
  }
}

function toFighterRecord(fighter: FighterEntry): FighterRecord {
  return { id: fighter.id, name: fighter.name, club: fighter.club, isSeeded: fighter.isSeeded };
}

function toFighterEntry(record: FighterRecord): FighterEntry {
  return {
    id: makeFighterId(record.id),
    name: record.name,
    club: record.club,
    isSeeded: record.isSeeded,
  };
}
