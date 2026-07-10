import type { RetrieveCompetitionsQuery } from "@hajime/core";
import { DemoRetrieveCompetitionsAdapter } from "../../competitions/adapters/demo-retrieve-competitions.adapter.ts";

export interface AppContainer {
  retrieveCompetitions: RetrieveCompetitionsQuery;
}

export function bootstrapContainer(env: ImportMetaEnv): AppContainer {
  if (env.DEV) {
    return {
      retrieveCompetitions: new DemoRetrieveCompetitionsAdapter(),
    };
  }

  /**
   * @todo TODO: swap with real HTTP adapters in production
   */
  return {
    retrieveCompetitions: new DemoRetrieveCompetitionsAdapter(),
  };
}
