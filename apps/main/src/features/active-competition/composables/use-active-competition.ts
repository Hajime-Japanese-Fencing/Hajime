import type { ReadonlyStore } from "@tanstack/store";
import { useSelector } from "@tanstack/vue-store";
import type { ActiveCompetition } from "@hajime/core";

function asSelectionSource<T>(store: ReadonlyStore<T>): {
  get: () => T;
  subscribe: (listener: (value: T) => void) => { unsubscribe: () => void };
} {
  return {
    get: () => store.state,
    subscribe: (listener) => store.subscribe(listener),
  };
}

export function useActiveCompetition(competition: ActiveCompetition) {
  const view = useSelector(asSelectionSource(competition.view), (view) => view);

  return {
    view,
    openFight: (fightId: Parameters<ActiveCompetition["openFight"]>[0]) =>
      competition.openFight(fightId),
    closeFight: () => competition.closeFight(),
    cancelActiveFight: () => competition.cancelActiveFight(),
    validateActiveFight: () => competition.validateActiveFight(),
    forfeitActiveFight: () => competition.forfeitActiveFight(),
    recordIppon: (input: Parameters<ActiveCompetition["recordIppon"]>[0]) =>
      competition.recordIppon(input),
    removeScoreEvent: (input: Parameters<ActiveCompetition["removeScoreEvent"]>[0]) =>
      competition.removeScoreEvent(input),
    recordHansoku: (input: Parameters<ActiveCompetition["recordHansoku"]>[0]) =>
      competition.recordHansoku(input),
  };
}
