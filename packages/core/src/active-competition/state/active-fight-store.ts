import { createStore } from "@tanstack/store";
import type { FightId } from "../../shared/fight-id.ts";

export type ActiveFightIdState = FightId | null;

export function createActiveFightIdStore() {
  const store = createStore<ActiveFightIdState>(null);

  function setActiveFightId(id: FightId | null): void {
    store.setState(() => id);
  }

  return { store, setActiveFightId };
}

export type ActiveFightIdStore = ReturnType<typeof createActiveFightIdStore>;
