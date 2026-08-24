export type CompetitionFormat = "bracket" | "pool_and_bracket";

export const CompetitionFormat = {
  Bracket: "bracket",
  PoolAndBracket: "pool_and_bracket",
} as const satisfies Record<string, CompetitionFormat>;

export const CompetitionFormatLabel = {
  bracket: "Tableau seul",
  pool_and_bracket: "Poules + tableau",
} as const satisfies Record<CompetitionFormat, string>;

export type CompetitionType = "individual" | "team";

export const CompetitionType = {
  Individual: "individual",
  Team: "team",
} as const satisfies Record<string, CompetitionType>;

export const CompetitionTypeLabel = {
  individual: "Individuel",
  team: "Par équipe",
} as const satisfies Record<CompetitionType, string>;

// --- WHAT NewCompetition.vue EMITS ON SUBMIT — DELIBERATELY NOT A (PARTIAL) CompetitionOverview:
// id/status DON'T EXIST YET AT THIS POINT (MINTED LATER BY A core USE-CASE), AND date IS KEPT AS
// THE RAW STRING FROM THE NATIVE <input type="date"> RATHER THAN A CompetitionDate — THE CALLER
// CONVERTS VIA CompetitionDate.fromISO(...), KEEPING THIS DUMB COMPONENT FREE OF ANY DOMAIN
// CONSTRUCTION LOGIC. ---
export interface NewCompetitionPayload {
  name: string;
  place: string;
  date: string;
  format: CompetitionFormat;
  type: CompetitionType;
  repulseByClub: boolean;
  repulseBySeed: boolean;
}
