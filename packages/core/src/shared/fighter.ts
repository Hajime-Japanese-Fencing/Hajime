import type { FighterId } from "./fighter-id.ts";

export interface FighterEntry {
  id: FighterId;
  name: string;
  isSeeded: boolean;
  club: string;
}
