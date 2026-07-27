import type { CompetitionId } from "../../shared/competition-id.ts";
import type { LoadCompetitionFightsPort } from "../ports/load-competition-fights.port.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";

export interface LoadCompetitionDeps {
  loadCompetitionFights: LoadCompetitionFightsPort;
  state: ActiveCompetitionState;
}

export async function loadCompetition(
  deps: LoadCompetitionDeps,
  competitionId: CompetitionId,
): Promise<void> {
  const data = await deps.loadCompetitionFights.load(competitionId);
  const maxScoreEventId = data.fights
    .flatMap((fight) => fight.scoreEvents)
    .reduce((max, scoreEvent) => Math.max(max, scoreEvent.id), 0);

  deps.state.replace({ ...data, nextScoreEventId: maxScoreEventId + 1 });
}
