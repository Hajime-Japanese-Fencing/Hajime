import type { BracketMatch } from "./bracket-match.interface.ts";

export interface BracketRound {
  order: number;
  matches: BracketMatch[];
}
