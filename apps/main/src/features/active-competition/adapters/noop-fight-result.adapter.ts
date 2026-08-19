import type { FightId, FightResultRecorder, FightStatus, ScoreEvent } from "@hajime/core";

/**
 * No-op. Persistence for the active competition is handled by mirroring the whole reactive
 * `ActiveCompetitionView` to `localStorage` on every change (see the subscription in
 * `bootstrapContainer`), not by patching individual fights through this port — that's the only
 * way to also capture bracket progression (`advanceBracket` promoting a now-ready pending match
 * into a real fight, filling the next round's slot), since that mutation goes straight through
 * `ActiveCompetitionState` with no corresponding port call this adapter could hook into.
 * `FightResultRecorder` still needs a real implementation to satisfy
 * `createActiveCompetition`'s dependencies, hence a no-op rather than no adapter at all.
 */
export class NoopFightResultAdapter implements FightResultRecorder {
  async saveScoreEvents(_fightId: FightId, _scoreEvents: ScoreEvent[]): Promise<void> {}

  async updateStatus(_fightId: FightId, _status: FightStatus): Promise<void> {}
}
