import type { Brand } from "./brand.ts";

export type PoolId = Brand<number, "PoolId">;

export function makePoolId(id: number): PoolId {
  return id as PoolId;
}
