import type { BracketRound } from "./bracket-round.interface.ts";

export interface Bracket {
  size: number;
  rounds: BracketRound[];
}
