import type { GeneratedFightsData } from "./save-generated-fights.port.ts";

export interface ApplyDrawPort {
  applyDraw(data: GeneratedFightsData): void;
}
