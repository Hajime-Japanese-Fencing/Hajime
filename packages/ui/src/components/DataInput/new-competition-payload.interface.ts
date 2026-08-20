// --- NO core EQUIVALENT EXISTS YET FOR "TOURNAMENT FORMAT" (packages/core ONLY MODELS pools/
// bracketRounds ON AN ALREADY-BUILT CompetitionDraw, NOT A COMPETITION-LEVEL CHOICE OF WHICH
// PHASES IT WILL HAVE) — DEFINED LOCALLY HERE FOR NOW, SAME string-union-PLUS-const-OBJECT
// PATTERN AS CompetitionStatus IN @hajime/core. IF/WHEN A REAL "GENERATE THIS COMPETITION'S
// DRAW" USE-CASE NEEDS TO BRANCH ON IT TOO, MOVE IT TO packages/core INSTEAD OF DUPLICATING IT. ---
export type CompetitionFormat = "bracket" | "pool_and_bracket";

export const CompetitionFormat = {
  Bracket: "bracket",
  PoolAndBracket: "pool_and_bracket",
} as const satisfies Record<string, CompetitionFormat>;

export const CompetitionFormatLabel = {
  bracket: "Tableau seul",
  pool_and_bracket: "Poules + tableau",
} as const satisfies Record<CompetitionFormat, string>;

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
  // --- WHETHER THE DRAW SHOULD KEEP FIGHTERS OF THE SAME CLUB / SAME SEED APART FOR AS LONG AS
  // POSSIBLE (E.G. IN OPPOSITE HALVES OF THE BRACKET, OR DIFFERENT POOLS) — LIKE format, THIS IS A
  // DRAW-GENERATION SETTING WITH NO core EQUIVALENT YET (build-bracket-draw / POOL DRAW DON'T
  // ACCEPT SUCH CONSTRAINTS TODAY), SO IT'S CARRIED HERE UNTIL A REAL USE-CASE CONSUMES IT. ---
  repulseByClub: boolean;
  repulseBySeed: boolean;
}
