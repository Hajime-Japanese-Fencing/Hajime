import { createStore } from "@tanstack/store";

const DEFAULT_DEBOUNCE_MS = 300;

// --- WRAPS EVERY STORED VALUE WITH A SCHEMA VERSION SO A FUTURE SHAPE CHANGE CAN BE DETECTED
// AT READ TIME. NO MIGRATION PATH EXISTS YET: A MISMATCH IS TREATED THE SAME AS "NOTHING
// PERSISTED" RATHER THAN CRASHING — REVISIT ONCE A REAL SCHEMA CHANGE NEEDS TO CARRY OLD DATA
// FORWARD INSTEAD OF JUST DROPPING IT. ---
interface PersistedEnvelope<T> {
  version: number;
  data: T;
}

export interface PersistedRecordStoreOptions {
  // --- PREFIX FOR THE localStorage KEY, ONE ENTRY PER id: `${keyPrefix}:${id}`. ---
  readonly keyPrefix: string;
  readonly schemaVersion?: number;
  readonly debounceMs?: number;
}

export interface PersistedRecordStore<T> {
  // --- READS THROUGH AN IN-MEMORY CACHE (A TanStack Store, KEYED BY id) SO A get() RIGHT
  // AFTER A set() SEES THE LATEST VALUE EVEN WHILE ITS localStorage WRITE IS STILL DEBOUNCED. ---
  get(id: string): T | undefined;
  set(id: string, value: T): void;
  // --- FORCES ANY PENDING DEBOUNCED WRITE TO HAPPEN IMMEDIATELY. CALL FOR id ON ANYTHING
  // TIME-SENSITIVE, OR WITH NO ARGUMENT (E.G. ON "beforeunload") TO FLUSH EVERY PENDING WRITE
  // OF THIS STORE BEFORE THE PAGE CAN DISAPPEAR. ---
  flush(id?: string): void;
}

/**
 * A `Record<id, T>` persisted to `localStorage`, one key per `id`, with debounced writes.
 *
 * Built as a small in-memory cache (TanStack Store, for consistency with the rest of the app's
 * state management, not for its reactivity — nothing here needs to be watched) in front of
 * `localStorage`: `set()` updates the cache synchronously and schedules a debounced write,
 * `get()` serves from the cache when present and falls back to reading (and caching) from
 * `localStorage` otherwise. This keeps rapid successive writes (e.g. ippon-by-ippon scoring
 * during a fight) from hitting `localStorage` on every single change, while still giving
 * read-your-writes consistency within the current session.
 */
export function createPersistedRecordStore<T>(
  options: PersistedRecordStoreOptions,
): PersistedRecordStore<T> {
  const schemaVersion = options.schemaVersion ?? 1;
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const cache = createStore<Record<string, T>>({});
  const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

  function storageKey(id: string): string {
    return `${options.keyPrefix}:${id}`;
  }

  function readFromStorage(id: string): T | undefined {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return undefined;

    try {
      const envelope = JSON.parse(raw) as PersistedEnvelope<T>;
      if (envelope.version !== schemaVersion) {
        console.warn(`[persistence] ignoring "${storageKey(id)}": schema version mismatch`);
        return undefined;
      }
      return envelope.data;
    } catch (error) {
      console.warn(`[persistence] ignoring corrupted "${storageKey(id)}"`, error);
      return undefined;
    }
  }

  function writeToStorage(id: string, value: T): void {
    const envelope: PersistedEnvelope<T> = { version: schemaVersion, data: value };
    try {
      localStorage.setItem(storageKey(id), JSON.stringify(envelope));
    } catch (error) {
      // --- MOST LIKELY A QUOTA ERROR. LOGGED AND SWALLOWED RATHER THAN THROWN: THE IN-MEMORY
      // CACHE STILL HAS THE LATEST VALUE, SO THE CURRENT SESSION KEEPS WORKING — ONLY A FUTURE
      // RELOAD WOULD MISS THIS PARTICULAR WRITE. ---
      console.error(`[persistence] failed to persist "${storageKey(id)}"`, error);
    }
  }

  function flush(id?: string): void {
    const ids = id ? [id] : [...pendingWrites.keys()];

    for (const pendingId of ids) {
      const timeout = pendingWrites.get(pendingId);
      if (!timeout) continue;

      clearTimeout(timeout);
      pendingWrites.delete(pendingId);
      writeToStorage(pendingId, cache.state[pendingId]);
    }
  }

  function get(id: string): T | undefined {
    const cached = cache.state[id];
    if (cached !== undefined) return cached;

    const fromStorage = readFromStorage(id);
    if (fromStorage !== undefined) {
      cache.setState((state) => ({ ...state, [id]: fromStorage }));
    }
    return fromStorage;
  }

  function set(id: string, value: T): void {
    cache.setState((state) => ({ ...state, [id]: value }));

    const pending = pendingWrites.get(id);
    if (pending) clearTimeout(pending);

    pendingWrites.set(
      id,
      setTimeout(() => {
        pendingWrites.delete(id);
        writeToStorage(id, value);
      }, debounceMs),
    );
  }

  return { get, set, flush };
}
