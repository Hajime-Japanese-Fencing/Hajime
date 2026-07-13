import { createStore } from "@tanstack/store";
import type { PoolId } from "../../shared/pool-id.ts";
import type { PoolRecord } from "../domain/pool-record.ts";

export type PoolsState = Readonly<Record<PoolId, PoolRecord>>;

export function createPoolStore() {
  const store = createStore<PoolsState>({});

  function setPools(pools: PoolRecord[]): void {
    const byId = Object.fromEntries(pools.map((pool) => [pool.id, pool])) as Record<
      PoolId,
      PoolRecord
    >;
    store.setState(() => byId);
  }

  return { store, setPools };
}

export type PoolStore = ReturnType<typeof createPoolStore>;
