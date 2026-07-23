import type { Brand } from "./brand.ts";

export type FightId = Brand<number, "FightId">;

export function makeFightId(id: number): FightId {
  return id as FightId;
}
