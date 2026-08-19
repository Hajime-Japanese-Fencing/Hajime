import Dexie, { type EntityTable } from "dexie";
import type { CompetitionStatus, CompetitionDate } from "@hajime/core";

export interface Competition {
  id: string;
  name: string;
  place: string;
  date: CompetitionDate;
  status: CompetitionStatus;
}

// Singleton Dexie instance
export const db = new Dexie("Database") as Dexie & {
  competitions: EntityTable<Competition, "id">; // primary key "id" (for the typings only)
};

db.version(1).stores({
  competitions: "&id, name, place, date, status", // primary key "id" (for the runtime!)
});
