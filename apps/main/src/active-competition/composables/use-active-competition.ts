import type { ReadonlyStore } from "@tanstack/store";
import { useSelector } from "@tanstack/vue-store";
import type { ActiveCompetitionFacade } from "@hajime/core";

function asSelectionSource<T>(store: ReadonlyStore<T>): {
  get: () => T;
  subscribe: (listener: (value: T) => void) => { unsubscribe: () => void };
} {
  return {
    get: () => store.state,
    subscribe: (listener) => store.subscribe(listener),
  };
}

export function useActiveCompetition(competition: ActiveCompetitionFacade) {
  const view = useSelector(asSelectionSource(competition.view), (view) => view);

  return {
    view,
    openFight: (fightId: Parameters<ActiveCompetitionFacade["openFight"]>[0]) =>
      competition.openFight(fightId),
    closeFight: () => competition.closeFight(),
    cancelActiveFight: () => competition.cancelActiveFight(),
    validateActiveFight: () => competition.validateActiveFight(),
    forfeitActiveFight: () => competition.forfeitActiveFight(),
    recordIppon: (input: Parameters<ActiveCompetitionFacade["recordIppon"]>[0]) =>
      competition.recordIppon(input),
    removeScoreEvent: (input: Parameters<ActiveCompetitionFacade["removeScoreEvent"]>[0]) =>
      competition.removeScoreEvent(input),
    recordHansoku: (input: Parameters<ActiveCompetitionFacade["recordHansoku"]>[0]) =>
      competition.recordHansoku(input),
  };
}
