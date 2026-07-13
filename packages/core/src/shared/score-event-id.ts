declare const __scoreEventIdBrand: unique symbol;

export type ScoreEventId = number & { readonly [__scoreEventIdBrand]: true };

export function makeScoreEventId(id: number): ScoreEventId {
  return id as ScoreEventId;
}
