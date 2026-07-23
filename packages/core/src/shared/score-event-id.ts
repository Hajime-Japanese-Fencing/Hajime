import type { Brand } from "./brand.ts";

export type ScoreEventId = Brand<number, "ScoreEventId">;

export function makeScoreEventId(id: number): ScoreEventId {
  return id as ScoreEventId;
}
