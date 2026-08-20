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

// Singleton Dexie instance
export const db = new Dexie("Database") as Dexie & {
  competitions: EntityTable<CompetitionRecord, "id">; // primary key "id" (for the typings only)
};

db.version(1).stores({
  competitions: "id, name, place, date, status", // primary key "id" (for the runtime!)
});
