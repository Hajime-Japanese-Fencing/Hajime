import {
  createActiveCompetitionStore,
  publishDraw as publishDrawUseCase,
  type ActiveCompetition,
  type CompetitionId,
  type GeneratedFightsData,
  type RetrieveCompetitionsQuery,
} from "@hajime/core";
import { DemoRetrieveCompetitionsAdapter } from "../../competitions/adapters/demo-retrieve-competitions.adapter.ts";
import { DemoSaveFightResultAdapter } from "../../active-competition/adapters/demo-save-fight-result.adapter.ts";
import { DemoSaveGeneratedFightsAdapter } from "../../active-competition/adapters/demo-save-generated-fights.adapter.ts";

export interface AppContainer {
  retrieveCompetitions: RetrieveCompetitionsQuery;
  activeCompetition: ActiveCompetition;
  publishDraw(competitionId: CompetitionId, draw: GeneratedFightsData): Promise<void>;
}

export function bootstrapContainer(_: ImportMetaEnv): AppContainer {
  const saveGeneratedFights = new DemoSaveGeneratedFightsAdapter();
  const activeCompetition = createActiveCompetitionStore({
    saveFightResult: new DemoSaveFightResultAdapter(),
  });
  const publishDraw = (competitionId: CompetitionId, draw: GeneratedFightsData) =>
    publishDrawUseCase({ applyDraw: activeCompetition, saveGeneratedFights }, competitionId, draw);

  return {
    retrieveCompetitions: new DemoRetrieveCompetitionsAdapter(),
    activeCompetition,
    publishDraw,
  };
}
