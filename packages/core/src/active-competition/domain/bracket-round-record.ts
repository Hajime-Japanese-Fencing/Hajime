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
  readonly order: number;
  // --- FIGHTS ALREADY PLAYABLE (BOTH FIGHTERS KNOWN) ---
  readonly fightIds: FightId[];
  // --- MATCHES OF THIS ROUND STILL WAITING ON A PREVIOUS ROUND'S WINNER(S) ---
  readonly pendingMatches: BracketPendingMatch[];
}
