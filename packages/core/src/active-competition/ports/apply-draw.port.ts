import type { CompetitionDraw } from "../../shared/competition-draw.ts";

export interface CompetitionDrawReceiver {
  applyDraw(draw: CompetitionDraw): void;
}
