import type { CompetitionDraw, CompetitionDrawRepository, CompetitionId } from "@hajime/core";

/**
 * No-op — see `NoopFightResultAdapter`. `publishDraw` calls `drawReceiver.applyDraw(draw)`
 * (updates the reactive state) before this port runs, so the state-mirroring subscription in
 * `bootstrapContainer` has already persisted the draw by the time `save()` would be called.
 */
export class NoopSaveGeneratedFightsAdapter implements CompetitionDrawRepository {
  async save(_competitionId: CompetitionId, _draw: CompetitionDraw): Promise<void> {}
}
