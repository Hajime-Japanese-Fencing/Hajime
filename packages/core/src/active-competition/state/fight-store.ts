import { createStore } from "@tanstack/store";
import type { FightId } from "../../shared/fight-id.ts";
import type { FightRecord } from "../domain/fight-record.ts";

export type FightsState = Readonly<Record<FightId, FightRecord>>;

export type FightPatch = Partial<FightRecord>;

export function createFightStore() {
  const store = createStore<FightsState>({});

  function setFights(fights: FightRecord[]): void {
    const byId = Object.fromEntries(fights.map((fight) => [fight.id, fight])) as Record<
      FightId,
      FightRecord
    >;
    store.setState(() => byId);
  }

  function updateFight(fightId: FightId, patch: FightPatch): void {
    store.setState((prev) => ({
      ...prev,
      [fightId]: { ...prev[fightId], ...patch },
    }));
  }

  return { store, setFights, updateFight };
}

export type FightStore = ReturnType<typeof createFightStore>;
