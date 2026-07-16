import type { FightStatus } from "../../fight.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { ScoreEvent } from "../domain/score-event.ts";
import type { SaveFightResultPort } from "../ports/save-fight-result.port.ts";

export interface SavedFightState {
  scoreEvents: ScoreEvent[];
  status: FightStatus;
}

/**
 * Fake adapter for SaveFightResultPort.
 * Designed for unit tests — stores state in-memory and exposes it for assertions.
 */
export class FakeSaveFightResultAdapter implements SaveFightResultPort {
  private savedEvents = new Map<FightId, ScoreEvent[]>();
  private savedStatuses = new Map<FightId, FightStatus>();

  async saveScoreEvents(fightId: FightId, scoreEvents: ScoreEvent[]): Promise<void> {
    this.savedEvents.set(fightId, scoreEvents);
  }

  async updateStatus(fightId: FightId, status: FightStatus): Promise<void> {
    this.savedStatuses.set(fightId, status);
  }

  getScoreEvents(fightId: FightId): ScoreEvent[] {
    return this.savedEvents.get(fightId) ?? [];
  }

  getStatus(fightId: FightId): FightStatus | undefined {
    return this.savedStatuses.get(fightId);
  }
}
