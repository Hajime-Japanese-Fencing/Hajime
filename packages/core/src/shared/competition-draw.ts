import type { FightRecord } from "./fight-record.ts";
import type { PoolRecord } from "./pool-record.ts";
import type { BracketRoundRecord } from "./bracket-round-record.ts";

export interface CompetitionDraw {
  readonly pools: PoolRecord[];
  readonly bracketRounds?: BracketRoundRecord[];
  readonly fights: FightRecord[];
}
