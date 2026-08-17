import type { FightStatus } from "./fight-status.ts";
import type { FighterId } from "./fighter-id.ts";
import type { FightId } from "./fight-id.ts";
import type { PoolId } from "./pool-id.ts";
import type { BracketRoundId } from "./bracket-round-id.ts";
import type { ScoreEvent } from "./score-event.ts";

export interface FightRecord {
  readonly id: FightId;
  // --- EXACTLY ONE OF poolId / bracketRoundId IS SET, DEPENDING ON WHETHER THIS FIGHT
  // BELONGS TO A POOL (ROUND-ROBIN) PHASE OR TO AN ELIMINATION BRACKET ROUND. ---
  readonly poolId: PoolId | null;
  readonly bracketRoundId: BracketRoundId | null;
  // --- POSITION OF THIS FIGHT'S MATCH WITHIN ITS BRACKET ROUND (null FOR POOL FIGHTS).
  // USED TO KNOW WHICH SLOT OF THE NEXT ROUND'S MATCH THE WINNER FEEDS INTO: EVEN INDEX ->
  // fighter1, ODD INDEX -> fighter2 OF MATCH floor(bracketMatchIndex / 2). SEE
  // `fillNextRoundSlot` IN `domain/bracket-progression.ts`. ---
  readonly bracketMatchIndex: number | null;
  readonly redFighterId: FighterId;
  // --- null ONLY FOR A BRACKET FIRST-ROUND BYE (SEE buildBracketDraw): redFighterId IS THE
  // ONLY REAL PARTICIPANT AND AUTOMATICALLY WINS (SEE determineFightWinner). NEVER null FOR A
  // POOL FIGHT OR A REAL BRACKET MATCHUP — BOTH SIDES ARE ALWAYS KNOWN THERE. ---
  readonly whiteFighterId: FighterId | null;
  readonly status: FightStatus;
  readonly scoreEvents: ScoreEvent[];
}
