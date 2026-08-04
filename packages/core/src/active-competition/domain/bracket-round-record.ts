import type { FightId } from "../../shared/fight-id.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import type { BracketRoundId } from "../../shared/bracket-round-id.ts";

// --- A MATCH OF THIS ROUND THAT ISN'T PLAYABLE YET BECAUSE ONE OR BOTH OF ITS FIGHTERS ARE
// STILL UNKNOWN (WAITING ON A PREVIOUS ROUND'S RESULT). ONCE BOTH SLOTS ARE FILLED IT GETS
// PROMOTED INTO A REAL FightRecord AND DROPPED FROM THIS LIST — SEE THE advance-bracket
// USE-CASE. matchIndex MIRRORS THE POSITION A FightRecord WOULD CARRY AS ITS
// bracketMatchIndex ONCE PROMOTED. ---
export interface BracketPendingMatch {
  readonly matchIndex: number;
  readonly fighter1: FighterId | null;
  readonly fighter2: FighterId | null;
}

export interface BracketRoundRecord {
  readonly id: BracketRoundId;
  // --- USED TO SORT ROUNDS FOR DISPLAY (E.G. AS TABS), AND TO LABEL "MAIN" ROUNDS BY THEIR
  // DISTANCE FROM THE FINAL (SEE getBracketRoundLabel). THE THIRD-PLACE ROUND SITS BETWEEN THE
  // SEMI-FINALS AND THE FINAL IN DISPLAY ORDER WITHOUT BEING PART OF THAT COUNTING, SO IT CAN
  // CARRY A NON-INTEGER VALUE (E.G. semiFinalOrder + 0.5). ---
  readonly order: number;
  // --- "main" IS A REGULAR ROUND OF THE ELIMINATION LADDER (QUARTER-FINALS, SEMI-FINALS,
  // FINAL...). "thirdPlace" IS THE MATCH BETWEEN THE TWO SEMI-FINAL LOSERS — IT RUNS
  // ALONGSIDE THE FINAL RATHER THAN BEFORE OR AFTER IT, SO IT'S EXCLUDED FROM THE MAIN
  // ROUND COUNT USED TO LABEL ROUNDS. DEFAULTS TO "main" WHEN OMITTED. ---
  readonly kind?: "main" | "thirdPlace";
  // --- WHERE THIS ROUND'S MATCH WINNERS GET SLOTTED NEXT (null FOR THE FINAL AND FOR THE
  // THIRD-PLACE MATCH, NEITHER OF WHICH FEEDS ANYTHING FURTHER). ---
  readonly feedsRoundId: BracketRoundId | null;
  // --- WHERE THIS ROUND'S MATCH LOSERS GET SLOTTED (ONLY SET ON THE SEMI-FINALS, POINTING AT
  // THE THIRD-PLACE ROUND). null/undefined EVERYWHERE ELSE — LOSERS ARE ELIMINATED. ---
  readonly loserFeedsRoundId?: BracketRoundId | null;
  // --- THE ROUND THAT MUST BE FULLY CONCLUDED (NO PENDING MATCHES, ALL FIGHTS FINISHED)
  // BEFORE THIS ROUND CAN BE OPENED IN THE UI. BOTH THE FINAL AND THE THIRD-PLACE MATCH POINT
  // AT THE SEMI-FINALS HERE, SINCE THEY CAN BE PLAYED IN EITHER ORDER RELATIVE TO EACH OTHER
  // BUT BOTH NEED THE SEMI-FINALS DONE FIRST. null FOR THE FIRST ROUND OF THE BRACKET. ---
  readonly dependsOnRoundId: BracketRoundId | null;
  // --- FIGHTS ALREADY PLAYABLE (BOTH FIGHTERS KNOWN) ---
  readonly fightIds: FightId[];
  // --- MATCHES OF THIS ROUND STILL WAITING ON A PREVIOUS ROUND'S WINNER(S)/LOSER(S) ---
  readonly pendingMatches: BracketPendingMatch[];
}
