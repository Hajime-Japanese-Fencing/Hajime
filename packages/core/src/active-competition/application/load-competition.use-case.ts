import type { CompetitionId } from "../../shared/competition-id.ts";
import type { CompetitionDrawLoader } from "../ports/load-competition-fights.port.ts";
import type { ActiveCompetitionState } from "../state/competition-state.ts";
import {
  loadRoster,
  type RosterRepositoryPort,
} from "../../competition-preparation/roster/index.ts";

export interface LoadCompetitionDeps {
  loadCompetitionFights: CompetitionDrawLoader;
  state: ActiveCompetitionState;
  rosterRepository: RosterRepositoryPort;
}

export async function loadCompetition(
  deps: LoadCompetitionDeps,
  competitionId: CompetitionId,
): Promise<void> {
  const [data, fighters] = await Promise.all([
    deps.loadCompetitionFights.load(competitionId),
    loadRoster({ rosterRepository: deps.rosterRepository }, competitionId),
  ]);

  const maxScoreEventId = data.fights
    .flatMap((fight) => fight.scoreEvents)
    .reduce((max, scoreEvent) => Math.max(max, scoreEvent.id), 0);

  deps.state.replace({
    ...data,
    nextScoreEventId: maxScoreEventId + 1,
    fighters,
  });
}
