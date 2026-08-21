import type { Brand } from "./brand.ts";
import type { CompetitionId } from "./competition-id.ts";

export type PoolId = Brand<string, "PoolId">;

export function makePoolId(competitionId: CompetitionId, poolNumber: number): PoolId {
  return `${competitionId}:${poolNumber}` as PoolId;
}

/*
 * Get a pool number directly from its ID by slicing out the competition id part
 */
export function poolNumberOf(poolId: PoolId): number {
  const [, poolNumber] = poolId.split(":");
  return Number(poolNumber);
}
