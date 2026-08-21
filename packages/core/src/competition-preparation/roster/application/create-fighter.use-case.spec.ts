import { describe, it, expect } from "vite-plus/test";
import { createFighterUseCase, type CreateFighterInput } from "./create-fighter.use-case.ts";
import { makeFighterId } from "../../../shared/fighter-id.ts";

function makeInput(overrides: Partial<CreateFighterInput> = {}): CreateFighterInput {
  return {
    name: "Fighter",
    club: "Paris Kendo Club",
    isSeeded: false,
    ...overrides,
  };
}

describe("Creating a fighter", () => {
  const generateId = () => "fighter-1";

  it("generates an id for the new fighter", () => {
    const fighter = createFighterUseCase({ generateId }, makeInput());

    expect(fighter.id).toStrictEqual(makeFighterId("fighter-1"));
  });

  it("generates a different id for each fighter", () => {
    let counter = 0;
    const uniqueGenerateId = () => `fighter-${++counter}`;

    const fighterA = createFighterUseCase({ generateId: uniqueGenerateId }, makeInput());
    const fighterB = createFighterUseCase({ generateId: uniqueGenerateId }, makeInput());

    expect(fighterA.id).not.toBe(fighterB.id);
  });

  it("keeps the club and isSeeded from the input", () => {
    const input = makeInput({ club: "Lyon Kendo Club", isSeeded: true });

    const fighter = createFighterUseCase({ generateId }, input);

    expect(fighter.club).toBe(input.club);
    expect(fighter.isSeeded).toBe(input.isSeeded);
  });

  it("keeps the name from the input", () => {
    const input = makeInput({ name: "FighterName" });

    const fighter = createFighterUseCase({ generateId }, input);

    expect(fighter.name).toBe(input.name);
  });
});
