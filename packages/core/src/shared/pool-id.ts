declare const __poolIdBrand: unique symbol;

export type PoolId = number & { readonly [__poolIdBrand]: true };

export function makePoolId(id: number): PoolId {
  return id as PoolId;
}
