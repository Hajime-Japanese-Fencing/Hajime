import type { CompetitionId } from "../../shared/competition-id.ts";
import type { ApplyDrawPort } from "../ports/apply-draw.port.ts";
import type {
  GeneratedFightsData,
  SaveGeneratedFightsPort,
} from "../ports/save-generated-fights.port.ts";

export interface PublishDrawDeps {
  applyDraw: ApplyDrawPort;
  saveGeneratedFights: SaveGeneratedFightsPort;
}

export async function publishDraw(
  deps: PublishDrawDeps,
  competitionId: CompetitionId,
  draw: GeneratedFightsData,
): Promise<void> {
  deps.applyDraw.applyDraw(draw);
  await deps.saveGeneratedFights.saveGeneratedFights(competitionId, draw);
}
