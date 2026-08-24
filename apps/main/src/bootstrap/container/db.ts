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

export interface CompetitionRosterRecord {
  competitionId: string;
  fighters: FighterRecord[];
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
  rosters: EntityTable<CompetitionRosterRecord, "competitionId">;
};

db.version(1).stores({
  competitions: "id, name, place, date, status", // primary key "id" (for the runtime!)
  fighters: "id, name, club, is_seeded",
});

// --- v2: REPLACES THE FLAT "fighters" TABLE (ONE ROW PER FIGHTER, NO LINK TO A COMPETITION) WITH
// "rosters" (ONE ROW PER COMPETITION, HOLDING THAT COMPETITION'S FIGHTER LIST). db.version(1) CAN'T
// BE REUSED WITH A DIFFERENT SHAPE: ANYONE WHO ALREADY OPENED THE APP UNDER THE OLD v1 HAS AN
// IndexedDB STUCK WITH THE fighters TABLE, AND DEXIE ONLY MIGRATES IT IF THE VERSION NUMBER GOES
// UP — STORES NOT LISTED HERE (competitions) CARRY OVER UNCHANGED FROM v1. ---
db.version(2).stores({
  fighters: null,
  rosters: "competitionId",
});
