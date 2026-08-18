import type { Bracket } from "@hajime/core";
import { createPersistedRecordStore } from "./persisted-record-store.ts";

// --- THE DRAFT Bracket AS PRODUCED BY generateBracketUseCase, KEPT SEPARATE FROM
// competitionDrawStore: IT'S THE PRE-MAPPING DOMAIN SHAPE (FighterEntry OBJECTS, NOT BRANDED
// IDS/RECORDS), PURELY FOR TRACEABILITY OF "WHAT WAS GENERATED" — NOTHING READS IT BACK YET,
// THE RUNTIME APP ONLY EVER CONSUMES THE MAPPED CompetitionDraw. ---
export const bracketDraftStore = createPersistedRecordStore<Bracket>({
  keyPrefix: "hajime:bracket-draft",
});
