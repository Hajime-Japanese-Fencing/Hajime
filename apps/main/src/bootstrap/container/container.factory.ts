import {
  buildBracketDraw,
  createActiveCompetition,
  generateBracketUseCase,
  publishDraw,
  type ActiveCompetition,
  type CompetitionDraw,
  type CompetitionId,
  type FighterEntry,
  type RetrieveCompetitionsQuery,
} from "@hajime/core";
import { DemoRetrieveCompetitionsAdapter } from "../../features/competition-overview/adapters/demo-retrieve-competitions.adapter.ts";
import { DemoLoadCompetitionFightsAdapter } from "../../features/active-competition/adapters/demo-load-competition-fights.adapter.ts";
import { DemoSaveFightResultAdapter } from "../../features/active-competition/adapters/demo-save-fight-result.adapter.ts";
import { DemoSaveGeneratedFightsAdapter } from "../../features/active-competition/adapters/demo-save-generated-fights.adapter.ts";
import { DemoSaveBracketAdapter } from "../../features/competition-preparation/adapters/demo-save-bracket.adapter.ts";

export interface AppContainer {
  retrieveCompetitions: RetrieveCompetitionsQuery;
  activeCompetition: ActiveCompetition;
  loadCompetition(competitionId: CompetitionId): Promise<void>;
  publishDraw(competitionId: CompetitionId, draw: CompetitionDraw): Promise<void>;
  // --- GENERATES A DIRECT-ELIMINATION BRACKET FOR THE GIVEN FIGHTERS AND PUBLISHES IT AS THE
  // COMPETITION'S DRAW (REPLACING WHATEVER WAS PREVIOUSLY LOADED/PUBLISHED). CHAINS THE DOMAIN
  // GENERATION (generateBracketUseCase) WITH THE RUNTIME MAPPING (buildBracketDraw) SO CALLERS
  // NEVER HANDLE THE INTERMEDIATE Bracket SHAPE. POOLS ARE ALWAYS EMPTY HERE SINCE POOL DRAW
  // GENERATION ISN'T WIRED UP YET. ---
  generateBracketDraw(competitionId: CompetitionId, fighters: FighterEntry[]): Promise<void>;
}

export function bootstrapContainer(_: ImportMetaEnv): AppContainer {
  const saveGeneratedFights = new DemoSaveGeneratedFightsAdapter();
  const saveBracket = new DemoSaveBracketAdapter();
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

  async function generateBracketDraw(
    competitionId: CompetitionId,
    fighters: FighterEntry[],
  ): Promise<void> {
    const bracket = await generateBracketUseCase({ saveBracket }, competitionId, fighters);
    const { bracketRounds, fights } = buildBracketDraw(bracket);

    await publishCompetitionDraw(competitionId, { pools: [], bracketRounds, fights });
  }

  return {
    retrieveCompetitions: new DemoRetrieveCompetitionsAdapter(),
    activeCompetition,
    loadCompetition: (competitionId) => activeCompetition.loadCompetition(competitionId),
    publishDraw: publishCompetitionDraw,
    generateBracketDraw,
  };
}
