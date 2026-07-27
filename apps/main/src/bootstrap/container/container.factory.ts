import {
  createActiveCompetition,
  publishDraw,
  type ActiveCompetition,
  type CompetitionDraw,
  type CompetitionId,
  type RetrieveCompetitionsQuery,
} from "@hajime/core";
import { DemoRetrieveCompetitionsAdapter } from "../../competitions/adapters/demo-retrieve-competitions.adapter.ts";
import { DemoLoadCompetitionFightsAdapter } from "../../active-competition/adapters/demo-load-competition-fights.adapter.ts";
import { DemoSaveFightResultAdapter } from "../../active-competition/adapters/demo-save-fight-result.adapter.ts";
import { DemoSaveGeneratedFightsAdapter } from "../../active-competition/adapters/demo-save-generated-fights.adapter.ts";

export interface AppContainer {
  retrieveCompetitions: RetrieveCompetitionsQuery;
  activeCompetition: ActiveCompetition;
  loadCompetition(competitionId: CompetitionId): Promise<void>;
  publishDraw(competitionId: CompetitionId, draw: CompetitionDraw): Promise<void>;
}

export function bootstrapContainer(_: ImportMetaEnv): AppContainer {
  const saveGeneratedFights = new DemoSaveGeneratedFightsAdapter();
  const activeCompetition = createActiveCompetition({
    loadCompetitionFights: new DemoLoadCompetitionFightsAdapter(),
    saveFightResult: new DemoSaveFightResultAdapter(),
  });
  const publishCompetitionDraw = (competitionId: CompetitionId, draw: CompetitionDraw) =>
    publishDraw(
      { drawReceiver: activeCompetition, drawRepository: saveGeneratedFights },
      competitionId,
      draw,
    );

  return {
    retrieveCompetitions: new DemoRetrieveCompetitionsAdapter(),
    activeCompetition,
    loadCompetition: (competitionId) => activeCompetition.loadCompetition(competitionId),
    publishDraw: publishCompetitionDraw,
  };
}
