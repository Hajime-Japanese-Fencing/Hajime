import { makeFighterId } from "../../../shared/fighter-id.ts";
import type { FighterEntry } from "../../../shared/fighter.ts";
import type { IdGenerator } from "../../../shared/id-generator.ts";

export interface CreateFighterUseCaseDeps {
  generateId: IdGenerator;
}

export interface CreateFighterInput {
  name: string;
  club: string;
  isSeeded: boolean;
}

/**
 * Creates a new fighter entry, generating its id.
 * Synchronous since there's no persistence for fighters so far
 */
export function createFighterUseCase(
  deps: CreateFighterUseCaseDeps,
  input: CreateFighterInput,
): FighterEntry {
  return {
    id: makeFighterId(deps.generateId()),
    name: input.name,
    club: input.club,
    isSeeded: input.isSeeded,
  };
}
