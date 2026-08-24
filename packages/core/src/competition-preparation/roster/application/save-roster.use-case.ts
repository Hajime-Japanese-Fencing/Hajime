import type { RosterRepositoryPort } from "../ports/roster-repository.port.ts";
import type { CompetitionId } from "../../../shared/competition-id.ts";
import type { FighterEntry } from "../../../shared/fighter.ts";

export interface SaveRosterDeps {
  rosterRepository: RosterRepositoryPort;
}

export async function saveRosterUseCase(
  deps: SaveRosterDeps,
  competitionId: CompetitionId,
  fighters: FighterEntry[],
): Promise<void> {
  await deps.rosterRepository.save(competitionId, fighters);
}
