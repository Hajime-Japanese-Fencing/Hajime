import { batch, createStore } from "@tanstack/store";
import type { ReadonlyStore } from "@tanstack/store";
import { FightStatus } from "../fight.ts";
import type { IpponCode } from "../ippons.ts";
import type { FightId } from "../shared/fight-id.ts";
import type { FighterId } from "../shared/fighter-id.ts";
import type { PoolId } from "../shared/pool-id.ts";
import { makeScoreEventId, type ScoreEventId } from "../shared/score-event-id.ts";
import type { FightRecord } from "./domain/fight-record.ts";
import type { PoolRecord } from "./domain/pool-record.ts";
import type { ScoreEvent } from "./domain/score-event.ts";
import type { SaveFightResultPort } from "./ports/save-fight-result.port.ts";
import { createActiveFightIdStore } from "./state/active-fight-store.ts";
import { createFightStore } from "./state/fight-store.ts";
import { createNextScoreEventIdStore } from "./state/next-score-event-id-store.ts";
import { createPoolStore } from "./state/pool-store.ts";
import type {
  GeneratedFightsData,
  SaveGeneratedFightsPort,
} from "./ports/save-generated-fights.port.ts";
import type { CompetitionId } from "../shared/competition-id.ts";

/**
 * @todo Les stores sont splittés mais anémiques... (vide)
 * Le Competition Store est un god object (dû à une première génération IA)
 * Il faut que chaque store récupère ses méthodes métier et communique entre stores...
 */

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

export interface ActiveCompetitionDeps {
  saveFightResult: SaveFightResultPort;
  saveGeneratedFights: SaveGeneratedFightsPort;
}

// ---------------------------------------------------------------------------
// Active competition aggregate
// ---------------------------------------------------------------------------

export function createActiveCompetitionStore(deps: ActiveCompetitionDeps) {
  const poolsStore = createPoolStore();
  const fightsStore = createFightStore();
  const activeFightIdStore = createActiveFightIdStore();
  const nextScoreEventIdStore = createNextScoreEventIdStore();

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  /** Currently active fight, or undefined if none is selected. */
  const activeFight: ReadonlyStore<FightRecord | undefined> = createStore(() => {
    const activeId = activeFightIdStore.store.state;
    if (activeId === null) return undefined;
    return fightsStore.store.state[activeId];
  });

  /** Fights belonging to a specific pool, in pool order. */
  function poolFights(poolId: PoolId): ReadonlyStore<ReadonlyArray<FightRecord>> {
    return createStore(() => {
      const pool = poolsStore.store.state[poolId];
      if (!pool) return [];
      return pool.fightIds
        .map((fightId) => fightsStore.store.state[fightId])
        .filter((fight): fight is FightRecord => fight !== undefined);
    });
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  function getFight(fightId: FightId): FightRecord | undefined {
    return fightsStore.store.state[fightId];
  }

  function hasActiveFight(): boolean {
    const activeId = activeFightIdStore.store.state;
    if (activeId === null) return false;
    const fight = getFight(activeId);
    return fight?.status === FightStatus.InProgress;
  }

  function persistStatus(fightId: FightId, status: FightStatus): void {
    void deps.saveFightResult.updateStatus(fightId, status);
  }

  function persistScoreEvents(fightId: FightId, scoreEvents: ScoreEvent[]): void {
    void deps.saveFightResult.saveScoreEvents(fightId, scoreEvents);
  }

  // -------------------------------------------------------------------------
  // Load / init
  // -------------------------------------------------------------------------

  function loadFights(pools: PoolRecord[], fights: FightRecord[]): void {
    const maxEventId = fights
      .flatMap((fight) => fight.scoreEvents)
      .reduce((max, event) => Math.max(max, event.id), 0);

    batch(() => {
      poolsStore.setPools(pools);
      fightsStore.setFights(fights);
      activeFightIdStore.setActiveFightId(null);
      nextScoreEventIdStore.setId(maxEventId + 1);
    });
  }

  // -------------------------------------------------------------------------
  // Use cases
  // -------------------------------------------------------------------------

  /**
   * Open a fight to start scoring it.
   * Guard: rejected (no-op) if another fight is already InProgress.
   */
  function openFight(fightId: FightId): void {
    if (hasActiveFight()) return;

    const fight = getFight(fightId);
    if (!fight) return;

    batch(() => {
      activeFightIdStore.setActiveFightId(fightId);

      if (fight.status === FightStatus.Waiting) {
        fightsStore.updateFight(fightId, { status: FightStatus.InProgress });
      }
    });

    if (fight.status === FightStatus.Waiting) {
      persistStatus(fightId, FightStatus.InProgress);
    }
  }

  /** Close the fight panel without changing fight status. */
  function closeFight(): void {
    activeFightIdStore.setActiveFightId(null);
  }

  /** Cancel an in-progress fight — revert to Waiting. */
  function cancelFight(fightId: FightId): void {
    batch(() => {
      activeFightIdStore.setActiveFightId(null);
      fightsStore.updateFight(fightId, { status: FightStatus.Waiting });
    });
    persistStatus(fightId, FightStatus.Waiting);
  }

  /** Validate a fight — mark as Finished. */
  function validateFight(fightId: FightId): void {
    batch(() => {
      activeFightIdStore.setActiveFightId(null);
      fightsStore.updateFight(fightId, { status: FightStatus.Finished });
    });
    persistStatus(fightId, FightStatus.Finished);
  }

  /** Record a forfeit — mark as Finished without scoring. */
  function forfeitFight(fightId: FightId): void {
    batch(() => {
      activeFightIdStore.setActiveFightId(null);
      fightsStore.updateFight(fightId, { status: FightStatus.Finished });
    });
    persistStatus(fightId, FightStatus.Finished);
  }

  /** Assign an ippon to a fighter in the active fight. */
  function assignIppon(fightId: FightId, fighterId: FighterId, code: IpponCode): void {
    const fight = getFight(fightId);
    if (!fight) return;

    const existingIppons = fight.scoreEvents.filter((event) => event.type === "ippon");
    const firstBlood = existingIppons.length === 0;

    const event: ScoreEvent = {
      id: makeScoreEventId(nextScoreEventIdStore.consume()),
      fighterId,
      type: "ippon",
      code,
      firstBlood,
    };

    const updatedEvents = [...fight.scoreEvents, event];
    fightsStore.updateFight(fightId, { scoreEvents: updatedEvents });
    persistScoreEvents(fightId, updatedEvents);
  }

  /** Remove an ippon by its score event ID. */
  function removeIppon(fightId: FightId, scoreEventId: ScoreEventId): void {
    const fight = getFight(fightId);
    if (!fight) return;

    const updatedEvents = fight.scoreEvents.filter((event) => event.id !== scoreEventId);
    fightsStore.updateFight(fightId, { scoreEvents: updatedEvents });
    persistScoreEvents(fightId, updatedEvents);
  }

  /** Assign a hansoku (penalty) to a fighter. */
  function assignHansoku(fightId: FightId, fighterId: FighterId): void {
    const fight = getFight(fightId);
    if (!fight) return;

    const event: ScoreEvent = {
      id: makeScoreEventId(nextScoreEventIdStore.consume()),
      fighterId,
      type: "hansoku",
      code: "Δ",
      firstBlood: false,
    };

    const updatedEvents = [...fight.scoreEvents, event];
    fightsStore.updateFight(fightId, { scoreEvents: updatedEvents });
    persistScoreEvents(fightId, updatedEvents);
  }

  /** Remove a hansoku by its score event ID. */
  function removeHansoku(fightId: FightId, scoreEventId: ScoreEventId): void {
    const fight = getFight(fightId);
    if (!fight) return;

    const updatedEvents = fight.scoreEvents.filter((event) => event.id !== scoreEventId);
    fightsStore.updateFight(fightId, { scoreEvents: updatedEvents });
    persistScoreEvents(fightId, updatedEvents);
  }

  /** saves a list of pools and a list of fights */
  function saveGeneratedFights(competitionId: CompetitionId, data: GeneratedFightsData): void {
    // Sends data to the store
    batch(() => {
      poolsStore.setPools(data.pools);
      fightsStore.setFights(data.fights);
    });

    //
    void deps.saveGeneratedFights.saveGeneratedFights(competitionId, data);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  return {
    pools: poolsStore.store,
    fights: fightsStore.store,
    activeFightId: activeFightIdStore.store,
    nextScoreEventId: nextScoreEventIdStore.store,
    activeFight,
    poolFights,
    loadFights,
    openFight,
    closeFight,
    cancelFight,
    validateFight,
    forfeitFight,
    assignIppon,
    removeIppon,
    assignHansoku,
    removeHansoku,
    saveGeneratedFights,
  };
}

export type ActiveCompetition = ReturnType<typeof createActiveCompetitionStore>;
