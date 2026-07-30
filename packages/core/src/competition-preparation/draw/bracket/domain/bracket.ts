import type { FighterEntry } from "../../../../shared/fighter.ts";

export interface Bracket {
  size: number;
  rounds: BracketRound[];
  thirdPlaceMatch: BracketMatch | null;
}

export interface BracketRound {
  order: number;
  matches: BracketMatch[];
}

export interface BracketMatch {
  fighter1: FighterEntry | null;
  fighter2: FighterEntry | null;
}
