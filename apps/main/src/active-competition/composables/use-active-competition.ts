import { useSelector } from "@tanstack/vue-store";
import type { ActiveCompetition, FightsState } from "@hajime/core";
import type { Store } from "@tanstack/store";

/**
 * Builds a SelectionSource from a TanStack Store.
 * This wrapper is structurally identical to what useSelector expects, avoiding
 * any mismatch between the Store class type and the SelectionSource interface.
 */
function asSelectionSource<T>(store: Store<T>): {
  get: () => T;
  subscribe: (listener: (value: T) => void) => { unsubscribe: () => void };
} {
  return {
    get: () => store.state,
    subscribe: (listener) => store.subscribe(listener),
  };
}

/**
 * Bridges the framework-agnostic TanStack Store with Vue reactivity.
 * Each selector creates a scoped subscription: components only re-render when
 * the selected slice actually changes.
 */
export function useActiveCompetition(competition: ActiveCompetition) {
  const fights = useSelector(asSelectionSource(competition.fights), (state: FightsState) =>
    Object.values(state),
  );
  const activeFightId = useSelector(asSelectionSource(competition.activeFightId), (id) =>
    id !== null ? id : null,
  );

  return {
    fights,
    activeFightId,
    openFight: competition.openFight,
    closeFight: competition.closeFight,
    cancelFight: competition.cancelFight,
    validateFight: competition.validateFight,
    forfeitFight: competition.forfeitFight,
    assignIppon: competition.assignIppon,
    removeIppon: competition.removeIppon,
    assignHansoku: competition.assignHansoku,
    removeHansoku: competition.removeHansoku,
  };
}
