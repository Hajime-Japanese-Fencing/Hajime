import type { CompetitionId } from "../../shared/competition-id.ts";
import type { CompetitionDraw } from "../domain/competition-draw.ts";
import type { CompetitionDrawReceiver } from "../ports/apply-draw.port.ts";
import type { CompetitionDrawRepository } from "../ports/save-generated-fights.port.ts";

export interface PublishDrawDeps {
  drawReceiver: CompetitionDrawReceiver;
  drawRepository: CompetitionDrawRepository;
}

export async function publishDraw(
  deps: PublishDrawDeps,
  competitionId: CompetitionId,
  draw: CompetitionDraw,
): Promise<void> {
  deps.drawReceiver.applyDraw(draw);
  await deps.drawRepository.save(competitionId, draw);
}
