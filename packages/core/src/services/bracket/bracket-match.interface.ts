import type { PoolFighterEntry } from "../fighter.interface.ts";

export interface BracketMatch {
  fighter1: PoolFighterEntry | null;
  fighter2: PoolFighterEntry | null;
}
