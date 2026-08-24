import Dexie, { type EntityTable } from "dexie";

/*
 * use string type for date because Dexie can't save properly the custom CompetitionDate format
 */
export interface CompetitionRecord {
  id: string;
  name: string;
  place: string;
  date: string;
  status: string;
}

export interface FighterRecord {
  id: string;
  name: string;
  club: string;
  isSeeded: boolean;
}

// Singleton Dexie instance
export const db = new Dexie("Database") as Dexie & {
  competitions: EntityTable<CompetitionRecord, "id">; // primary key "id" (for the typings only)
  fighters: EntityTable<FighterRecord, "id">;
};

db.version(1).stores({
  competitions: "id, name, place, date, status", // primary key "id" (for the runtime!)
  fighters: "id, name, club, is_seeded",
});
