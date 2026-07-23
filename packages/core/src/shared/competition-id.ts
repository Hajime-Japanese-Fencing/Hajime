import type { Brand } from "./brand.ts";

export type CompetitionId = Brand<string, "CompetitionId">;

export function makeCompetitionId(id: string): CompetitionId {
  return id as CompetitionId;
}
