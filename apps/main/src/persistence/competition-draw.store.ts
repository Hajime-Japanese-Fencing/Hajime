import type { CompetitionDraw } from "@hajime/core";
import { createPersistedRecordStore } from "./persisted-record-store.ts";

// --- ONE localStorage ENTRY PER COMPETITION, HOLDING THE FULL CompetitionDraw — TOPOLOGY
// (pools / bracketRounds) AND FIGHTS (INCLUDING EACH FIGHT'S LIVE status/scoreEvents) TOGETHER.
// A SINGLE BLOB RATHER THAN SPLITTING "DRAW" AND "FIGHT RESULTS" INTO SEPARATE KEYS: FightRecord
// ALREADY CARRIES status/scoreEvents INLINE, SO THERE'S NO NATURAL SEAM TO SPLIT ON WITHOUT
// HAVING TO MERGE TWO SOURCES BACK TOGETHER ON EVERY READ. CompetitionDrawRepository OVERWRITES
// THE WHOLE BLOB (DRAW GENERATION/PUBLISH); FightResultRecorder PATCHES ONE FIGHT INSIDE IT
// (SEE local-storage-save-fight-result.adapter.ts). ---
export const competitionDrawStore = createPersistedRecordStore<CompetitionDraw>({
  keyPrefix: "hajime:competition-draw",
});
