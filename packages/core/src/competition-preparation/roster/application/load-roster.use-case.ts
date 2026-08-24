import type { RosterRepositoryPort } from "../ports/roster-repository.port.ts";
import type { CompetitionId } from "../../../shared/competition-id.ts";
import type { FighterEntry } from "../../../shared/fighter.ts";

export interface LoadRosterDeps {
  rosterRepository: RosterRepositoryPort;
}

export async function loadRoster(
  deps: LoadRosterDeps,
  competitionId: CompetitionId,
): Promise<FighterEntry[]> {
  return deps.rosterRepository.load(competitionId);
}
