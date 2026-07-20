import {
  createActiveCompetitionStore,
  type ActiveCompetition,
  type RetrieveCompetitionsQuery,
} from "@hajime/core";
import { DemoRetrieveCompetitionsAdapter } from "../../competitions/adapters/demo-retrieve-competitions.adapter.ts";
import { DemoSaveFightResultAdapter } from "../../active-competition/adapters/demo-save-fight-result.adapter.ts";
import { DemoSaveGeneratedFightsAdapter } from "../../active-competition/adapters/demo-save-generated-fights.adapter.ts";

export interface AppContainer {
  retrieveCompetitions: RetrieveCompetitionsQuery;
  activeCompetition: ActiveCompetition;
}

export function bootstrapContainer(env: ImportMetaEnv): AppContainer {
  const activeCompetition = createActiveCompetitionStore({
    saveFightResult: new DemoSaveFightResultAdapter(),
    saveGeneratedFights: new DemoSaveGeneratedFightsAdapter(),
  });

  if (env.DEV) {
    return {
      retrieveCompetitions: new DemoRetrieveCompetitionsAdapter(),
      activeCompetition,
    };
  }

  /**
   * @todo TODO: swap with real HTTP adapters in production
   */
  return {
    retrieveCompetitions: new DemoRetrieveCompetitionsAdapter(),
    activeCompetition,
  };
}
