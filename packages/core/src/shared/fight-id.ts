import type { Brand } from "./brand.ts";

export type FightId = Brand<string, "FightId">;

export function makeFightId(id: string): FightId {
  return id as FightId;
}
