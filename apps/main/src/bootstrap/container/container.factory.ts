import {
  createActiveCompetitionFacade,
  publishDraw as publishDrawUseCase,
  type ActiveCompetitionFacade,
  type CompetitionId,
  type GeneratedFightsData,
  type RetrieveCompetitionsQuery,
} from "@hajime/core";
import { DemoRetrieveCompetitionsAdapter } from "../../competitions/adapters/demo-retrieve-competitions.adapter.ts";
import { DemoLoadCompetitionFightsAdapter } from "../../active-competition/adapters/demo-load-competition-fights.adapter.ts";
import { DemoSaveFightResultAdapter } from "../../active-competition/adapters/demo-save-fight-result.adapter.ts";
import { DemoSaveGeneratedFightsAdapter } from "../../active-competition/adapters/demo-save-generated-fights.adapter.ts";

export interface AppContainer {
  retrieveCompetitions: RetrieveCompetitionsQuery;
  activeCompetition: ActiveCompetitionFacade;
  loadCompetition(competitionId: CompetitionId): Promise<void>;
  publishDraw(competitionId: CompetitionId, draw: GeneratedFightsData): Promise<void>;
}

export function bootstrapContainer(_: ImportMetaEnv): AppContainer {
  const saveGeneratedFights = new DemoSaveGeneratedFightsAdapter();
  const activeCompetition = createActiveCompetitionFacade({
    loadCompetitionFights: new DemoLoadCompetitionFightsAdapter(),
    saveFightResult: new DemoSaveFightResultAdapter(),
  });
  const publishDraw = (competitionId: CompetitionId, draw: GeneratedFightsData) =>
    publishDrawUseCase({ applyDraw: activeCompetition, saveGeneratedFights }, competitionId, draw);

  return {
    retrieveCompetitions: new DemoRetrieveCompetitionsAdapter(),
    activeCompetition,
    loadCompetition: (competitionId) => activeCompetition.loadCompetition(competitionId),
    publishDraw,
  };
}
