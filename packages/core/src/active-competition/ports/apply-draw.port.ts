import type { CompetitionDraw } from "../domain/competition-draw.ts";

export interface CompetitionDrawReceiver {
  applyDraw(draw: CompetitionDraw): void;
}
