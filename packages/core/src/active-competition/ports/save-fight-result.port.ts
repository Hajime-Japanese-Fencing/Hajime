import type { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { ScoreEvent } from "../domain/score-event.ts";

export interface SaveFightResultPort {
  saveScoreEvents(fightId: FightId, scoreEvents: ScoreEvent[]): Promise<void>;
  updateStatus(fightId: FightId, status: FightStatus): Promise<void>;
}
