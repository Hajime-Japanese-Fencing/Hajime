import { makeCompetitionId } from "../../shared/competition-id.ts";
import type { IdGenerator } from "../../shared/id-generator.ts";
import type { CompetitionDate } from "../domain/competition-date.ts";
import type { CompetitionOverview } from "../domain/competition-overview.ts";
import { CompetitionStatus } from "../domain/competition-status.ts";
import type { SaveCompetitionPort } from "../ports/save-competition.port.ts";

export interface CreateCompetitionUseCaseDeps {
  saveCompetition: SaveCompetitionPort;
  generateId: IdGenerator;
}

export interface CreateCompetitionInput {
  name: string;
  place: string;
  date: CompetitionDate;
}

/**
 * Creates a brand-new competition (generating its id, defaulting its status to "Creation")
 * and persists it.
 */
export async function createCompetitionUseCase(
  deps: CreateCompetitionUseCaseDeps,
  input: CreateCompetitionInput,
): Promise<CompetitionOverview> {
  const competition: CompetitionOverview = {
    id: makeCompetitionId(deps.generateId()),
    name: input.name,
    place: input.place,
    date: input.date,
    status: CompetitionStatus.Creation,
  };

  await deps.saveCompetition.save(competition);

  return competition;
}
