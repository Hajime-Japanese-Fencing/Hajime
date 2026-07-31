import type { Brand } from "./brand.ts";

export type BracketRoundId = Brand<number, "BracketRoundId">;

export function makeBracketRoundId(id: number): BracketRoundId {
  return id as BracketRoundId;
}
