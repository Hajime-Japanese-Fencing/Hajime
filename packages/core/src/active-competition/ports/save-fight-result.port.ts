import type { FightStatus } from "../../shared/fight-status.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { ScoreEvent } from "../../shared/score-event.ts";

export interface FightResultRecorder {
  saveScoreEvents(fightId: FightId, scoreEvents: ScoreEvent[]): Promise<void>;
  updateStatus(fightId: FightId, status: FightStatus): Promise<void>;
}
