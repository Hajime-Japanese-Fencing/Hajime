import type { PoolFighterEntry } from "../services/fighter.interface.ts";

export function poolFighterEntryFactory(fighterEntry: Partial<PoolFighterEntry>): PoolFighterEntry {
  return {
    id: "1",
    isSeriesHead: false,
    club: "Club A",
    ...fighterEntry,
  };
}
