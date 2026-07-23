import type { Brand } from "./brand.ts";

export type FighterId = Brand<string, "FighterId">;

export function makeFighterId(id: string): FighterId {
  return id as FighterId;
}
