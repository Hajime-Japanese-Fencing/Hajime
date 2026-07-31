import type { FightId } from "../../shared/fight-id.ts";
import type { BracketRoundId } from "../../shared/bracket-round-id.ts";

export interface BracketRoundRecord {
  readonly id: BracketRoundId;
  readonly order: number;
  readonly fightIds: FightId[];
}
