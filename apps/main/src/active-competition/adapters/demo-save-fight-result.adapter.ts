import type { FightStatus } from "@hajime/core";
import type { FightId, ScoreEvent, SaveFightResultPort } from "@hajime/core";

/**
 * In-memory adapter — logs mutations to the console.
 * Replace with a real HTTP/DB adapter in production.
 */
export class DemoSaveFightResultAdapter implements SaveFightResultPort {
  async saveScoreEvents(fightId: FightId, scoreEvents: ScoreEvent[]): Promise<void> {
    console.debug("[demo] saveScoreEvents", fightId, scoreEvents);
  }

  async updateStatus(fightId: FightId, status: FightStatus): Promise<void> {
    console.debug("[demo] updateStatus", fightId, status);
  }
}
