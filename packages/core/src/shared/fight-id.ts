declare const __fightIdBrand: unique symbol;

export type FightId = number & { readonly [__fightIdBrand]: true };

export function makeFightId(id: number): FightId {
  return id as FightId;
}
