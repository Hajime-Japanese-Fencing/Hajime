import type { FightRecord } from "./fight-record.ts";
import type { PoolRecord } from "./pool-record.ts";

export interface CompetitionDraw {
  readonly pools: PoolRecord[];
  readonly fights: FightRecord[];
}
