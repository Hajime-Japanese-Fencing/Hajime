import {
  buildBracketDraw,
  createActiveCompetition,
  createCompetitionUseCase,
  createFighterUseCase,
  generateBracketUseCase,
  publishDraw,
  uuidGenerator,
  type ActiveCompetition,
  type CompetitionDraw,
  type CompetitionId,
  type CompetitionOverview,
  type CreateCompetitionInput,
  type CreateFighterInput,
  type FighterEntry,
  type IdGenerator,
  type RetrieveCompetitionsQuery,
  type SaveCompetitionPort,
} from "@hajime/core";
import { BrowserSaveCompetitionAdapter } from "../../features/competition-overview/adapters/browser-save-competition.adapter.ts";
import { LocalStorageLoadCompetitionFightsAdapter } from "../../features/active-competition/adapters/local-storage-load-competition-fights.adapter.ts";
import { NoopFightResultAdapter } from "../../features/active-competition/adapters/noop-fight-result.adapter.ts";
import { NoopSaveGeneratedFightsAdapter } from "../../features/active-competition/adapters/noop-save-generated-fights.adapter.ts";
import { LocalStorageSaveBracketAdapter } from "../../features/competition-preparation/adapters/local-storage-save-bracket.adapter.ts";
import { competitionDrawStore } from "../../persistence/competition-draw.store.ts";
import { bracketDraftStore } from "../../persistence/bracket-draft.store.ts";
import { DemoRetrieveCompetitionsQuery } from "../../features/competition-overview/adapters/demo-retrieve-competitions.query.ts";

export interface AppContainer {
  retrieveCompetitions: RetrieveCompetitionsQuery;
  createCompetition(input: CreateCompetitionInput): Promise<CompetitionOverview>;
  createFighter(input: CreateFighterInput): FighterEntry;
  activeCompetition: ActiveCompetition;
  loadCompetition(competitionId: CompetitionId): Promise<void>;
  publishDraw(competitionId: CompetitionId, draw: CompetitionDraw): Promise<void>;
  generateBracketDraw(competitionId: CompetitionId, fighters: FighterEntry[]): Promise<void>;
}

export function bootstrapContainer(_: ImportMetaEnv): AppContainer {
  // --- THE ONE PLACE THAT TRACKS WHICH COMPETITION IS CURRENTLY LOADED — NOTHING IN
  // ActiveCompetitionSnapshot ITSELF CARRIES A CompetitionId (SEE competition-state.ts), AND
  // FightResultRecorder's METHODS ONLY TAKE A FightId. THE state-MIRRORING SUBSCRIPTION BELOW
  // NEEDS THIS TO KNOW WHICH localStorage KEY TO WRITE TO. ---
  let currentCompetitionId: CompetitionId | null = null;

  const saveBracket = new LocalStorageSaveBracketAdapter();
  // --- SaveCompetitionPort'S CONCRETE IMPLEMENTATION LIVES HERE, AND ONLY HERE — THIS IS THE ONE
  // LINE createCompetition WOULD NEED TO CHANGE TO SWITCH BACKENDS (E.G. BACK TO AN IN-MEMORY
  // ADAPTER FOR A DEMO BUILD), MIRRORING HOW retrieveCompetitions BELOW IS THE ONE PLACE THAT
  // PICKS BrowserRetrieveCompetitionsQuery OVER DemoRetrieveCompetitionsQuery (STILL AVAILABLE,
  // JUST UNUSED FOR NOW). ---
  const saveCompetition: SaveCompetitionPort = new BrowserSaveCompetitionAdapter();
  // --- SAME REASONING AS saveCompetition ABOVE: THE ONE PLACE THIS CONTAINER PICKS ITS CONCRETE
  // IdGenerator, REUSED BY EVERY USE-CASE/BUILDER THAT NEEDS ONE (createCompetition,
  // generateBracketDraw) INSTEAD OF EACH REFERENCING uuidGenerator DIRECTLY. ---
  const generateId: IdGenerator = uuidGenerator;
  const activeCompetition = createActiveCompetition({
    loadCompetitionFights: new LocalStorageLoadCompetitionFightsAdapter(),
    // --- NO-OP: SEE THE SUBSCRIPTION BELOW FOR WHY. ---
    saveFightResult: new NoopFightResultAdapter(),
    generateId: generateId,
  });

  // --- PERSISTS BY MIRRORING THE WHOLE REACTIVE ActiveCompetitionView TO localStorage ON EVERY
  // CHANGE, RATHER THAN HAVING EACH PORT (CompetitionDrawRepository, FightResultRecorder)
  // SURGICALLY PATCH ITS OWN SLICE. THAT SURGICAL APPROACH WAS THE ORIGINAL DESIGN AND HAD A
  // REAL GAP: advanceBracket (PROMOTING A NOW-READY PENDING MATCH INTO A REAL FightRecord,
  // FILLING THE NEXT ROUND'S SLOT) MUTATES ActiveCompetitionState DIRECTLY VIA
  // state.advanceBracket(...) — THERE IS NO PORT CALL FOR "THE BRACKET ADVANCED" AT ALL, SO A
  // PORT-BY-PORT ADAPTER CAN NEVER OBSERVE IT. RESULT: A FIGHT'S OWN status/scoreEvents
  // PERSISTED FINE, BUT THE WINNER IT PROMOTED INTO THE NEXT ROUND WAS LOST ON RELOAD.
  // SUBSCRIBING TO THE VIEW SIDESTEPS THE PROBLEM ENTIRELY: WHATEVER CHANGED, THIS SEES THE
  // RESULT AND PERSISTS IT, UNIFORMLY. ---
  activeCompetition.view.subscribe(() => {
    if (!currentCompetitionId) return;

    const view = activeCompetition.view.state;
    competitionDrawStore.set(currentCompetitionId, {
      pools: [...view.pools],
      bracketRounds: [...view.bracketRounds],
      fights: [...view.fights],
    });
  });

  // SAFETY NET FOR THE DEBOUNCED localStorage WRITES
  window.addEventListener("beforeunload", () => {
    competitionDrawStore.flush();
    bracketDraftStore.flush();
  });

  async function createCompetition(input: CreateCompetitionInput): Promise<CompetitionOverview> {
    return createCompetitionUseCase({ saveCompetition, generateId }, input);
  }

  function createFighter(input: CreateFighterInput): FighterEntry {
    return createFighterUseCase({ generateId }, input);
  }

  async function loadCompetition(competitionId: CompetitionId): Promise<void> {
    currentCompetitionId = competitionId;
    await activeCompetition.loadCompetition(competitionId);
  }

  const publishCompetitionDraw = (competitionId: CompetitionId, draw: CompetitionDraw) => {
    currentCompetitionId = competitionId;
    return publishDraw(
      // --- NO-OP drawRepository: applyDraw() (CALLED FIRST, INSIDE publishDraw) UPDATES THE
      // REACTIVE STATE SYNCHRONOUSLY, SO THE SUBSCRIPTION ABOVE HAS ALREADY PERSISTED THE DRAW
      // BY THE TIME drawRepository.save() WOULD RUN. ---
      { drawReceiver: activeCompetition, drawRepository: new NoopSaveGeneratedFightsAdapter() },
      competitionId,
      draw,
    );
  };

  async function generateBracketDraw(
    competitionId: CompetitionId,
    fighters: FighterEntry[],
  ): Promise<void> {
    // --- KEEPS currentCompetitionId CORRECT EVEN IF THIS IS CALLED WITHOUT A PRIOR
    // loadCompetition (E.G. GENERATING A DRAW FOR A BRAND NEW COMPETITION) — SAME REASON
    // loadCompetition SETS IT, SEE THE COMMENT ABOVE. ---
    currentCompetitionId = competitionId;

    const bracket = await generateBracketUseCase({ saveBracket }, competitionId, fighters);
    const { bracketRounds, fights } = buildBracketDraw(bracket, generateId, competitionId);

    await publishCompetitionDraw(competitionId, { pools: [], bracketRounds, fights });
  }

  return {
    retrieveCompetitions: new DemoRetrieveCompetitionsQuery(),
    createCompetition,
    createFighter,
    activeCompetition,
    loadCompetition,
    publishDraw: publishCompetitionDraw,
    generateBracketDraw,
  };
}
