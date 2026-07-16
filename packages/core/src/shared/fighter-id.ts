declare const __fighterIdBrand: unique symbol;

export type FighterId = string & { readonly [__fighterIdBrand]: true };

export function makeFighterId(id: string): FighterId {
  return id as FighterId;
}
