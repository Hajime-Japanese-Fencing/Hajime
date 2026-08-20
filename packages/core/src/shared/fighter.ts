import type { FighterId } from "./fighter-id.ts";

export interface FighterEntry {
  id: FighterId;
  isSeeded: boolean;
  club: string;
}
