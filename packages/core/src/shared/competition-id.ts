declare const __competitionIdBrand: unique symbol;

export type CompetitionId = string & { readonly [__competitionIdBrand]: true };

export function makeCompetitionId(id: string): CompetitionId {
  return id as CompetitionId;
}
