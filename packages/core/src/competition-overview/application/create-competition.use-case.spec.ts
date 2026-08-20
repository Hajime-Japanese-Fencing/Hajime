import { describe, it, expect } from "vite-plus/test";
import {
  createCompetitionUseCase,
  type CreateCompetitionInput,
} from "./create-competition.use-case.ts";
import { SpySaveCompetitionAdapter } from "../__test__/spy-save-competition.adapter.ts";
import { makeCompetitionId } from "../../shared/competition-id.ts";
import { CompetitionDate } from "../domain/competition-date.ts";
import { CompetitionStatus } from "../domain/competition-status.ts";

// helper function
function makeInput(overrides: Partial<CreateCompetitionInput> = {}): CreateCompetitionInput {
  return {
    name: "Open de Paris",
    place: "Dojo de Paris",
    date: CompetitionDate.fromISO("2026-09-15"),
    ...overrides,
  };
}

describe("Creating a competition", () => {
  const generateId = () => "competition-1";

  it("generates an id for the new competition", async () => {
    const saveCompetition = new SpySaveCompetitionAdapter();

    const competition = await createCompetitionUseCase(
      { saveCompetition, generateId },
      makeInput(),
    );

    expect(competition.id).toStrictEqual(makeCompetitionId("competition-1"));
  });

  it("mints a different id for each competition", async () => {
    const saveCompetition = new SpySaveCompetitionAdapter();
    let counter = 0;
    const uniqueGenerateId = () => `competition-${++counter}`;

    const competitionA = await createCompetitionUseCase(
      { saveCompetition, generateId: uniqueGenerateId },
      makeInput(),
    );
    const competitionB = await createCompetitionUseCase(
      { saveCompetition, generateId: uniqueGenerateId },
      makeInput(),
    );

    expect(competitionA.id).not.toBe(competitionB.id);
  });

  it("defaults the status to Creation", async () => {
    const saveCompetition = new SpySaveCompetitionAdapter();

    const competition = await createCompetitionUseCase(
      { saveCompetition, generateId },
      makeInput(),
    );

    expect(competition.status).toBe(CompetitionStatus.Creation);
  });

  it("keeps the name, place and date from the input", async () => {
    const saveCompetition = new SpySaveCompetitionAdapter();
    const input = makeInput();

    const competition = await createCompetitionUseCase({ saveCompetition, generateId }, input);

    expect(competition.name).toBe(input.name);
    expect(competition.place).toBe(input.place);
    expect(competition.date).toBe(input.date);
  });

  it("persists the competition via the port", async () => {
    const saveCompetition = new SpySaveCompetitionAdapter();

    const competition = await createCompetitionUseCase(
      { saveCompetition, generateId },
      makeInput(),
    );

    expect(saveCompetition.callCount).toBe(1);
    expect(saveCompetition.getCompetition(competition.id)).toStrictEqual(competition);
  });
});
