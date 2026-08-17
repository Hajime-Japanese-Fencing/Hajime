import type { ReadonlyStore } from "@tanstack/store";
import type { CompetitionId } from "../../shared/competition-id.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { IpponCode } from "../../shared/ippons.ts";
import type { ScoreEventId } from "../../shared/score-event-id.ts";
import type { Side } from "../../shared/side.ts";
import { cancelFight } from "./cancel-fight.use-case.ts";
import type { FightActionResult } from "./command-result.ts";
import { finishFight } from "./finish-fight.use-case.ts";
import { loadCompetition } from "./load-competition.use-case.ts";
import { recordHansoku, recordIppon } from "./record-score-event.use-case.ts";
import { removeScoreEvent } from "./remove-score-event.use-case.ts";
import { startFight } from "./start-fight.use-case.ts";
import type { CompetitionDraw } from "../../shared/competition-draw.ts";
import type { ScoreEventType } from "../../shared/score-event.ts";
import type { CompetitionDrawReceiver } from "../ports/apply-draw.port.ts";
import type { CompetitionDrawLoader } from "../ports/load-competition-fights.port.ts";
import type { FightResultRecorder } from "../ports/save-fight-result.port.ts";
import { createActiveCompetitionView } from "../state/active-competition-view.ts";
import type { ActiveCompetitionView } from "../state/active-competition-view.ts";
import { createCompetitionState } from "../state/competition-state.ts";

export type { ActiveCompetitionView } from "../state/active-competition-view.ts";

export interface ActiveCompetitionDeps {
  readonly loadCompetitionFights: CompetitionDrawLoader;
  readonly saveFightResult: FightResultRecorder;
}

export interface ActiveCompetition extends CompetitionDrawReceiver {
  readonly view: ReadonlyStore<ActiveCompetitionView>;
  loadCompetition(competitionId: CompetitionId): Promise<void>;
  openFight(fightId: FightId): Promise<FightActionResult>;
  closeFight(): void;
  cancelActiveFight(): Promise<FightActionResult>;
  validateActiveFight(): Promise<FightActionResult>;
  forfeitActiveFight(): Promise<FightActionResult>;
  recordIppon(input: { side: Side; code: IpponCode }): Promise<FightActionResult>;
  recordHansoku(input: { side: Side }): Promise<FightActionResult>;
  removeScoreEvent(input: {
    scoreEventId: ScoreEventId;
    type: ScoreEventType;
  }): Promise<FightActionResult>;
}

export function createActiveCompetition(deps: ActiveCompetitionDeps): ActiveCompetition {
  const state = createCompetitionState();
  const view = createActiveCompetitionView(state);
  const useCaseDeps = { state, saveFightResult: deps.saveFightResult };

  function activeFightId(): FightId | undefined {
    return state.snapshot().activeFightId ?? undefined;
  }

  function applyDraw(data: CompetitionDraw): void {
    const maxScoreEventId = data.fights
      .flatMap((fight) => fight.scoreEvents)
      .reduce((max, scoreEvent) => Math.max(max, scoreEvent.id), 0);
    const maxFightId = data.fights.reduce((max, fight) => Math.max(max, fight.id), 0);

    state.replace({
      ...data,
      nextScoreEventId: maxScoreEventId + 1,
      nextFightId: maxFightId + 1,
    });
  }

  function closeFight(): void {
    state.setActiveFightId(null);
  }

  async function cancelActiveFight(): Promise<FightActionResult> {
    const fightId = activeFightId();
    if (!fightId) return { ok: false, reason: "not_active" };

    return cancelFight(useCaseDeps, fightId);
  }

  async function finishActiveFight(): Promise<FightActionResult> {
    const fightId = activeFightId();
    if (!fightId) return { ok: false, reason: "not_active" };

    return finishFight(useCaseDeps, fightId);
  }

  async function recordScore(
    input: { side: Side },
    record: (fightId: FightId, fighterId: FighterId) => Promise<FightActionResult>,
  ): Promise<FightActionResult> {
    const fightId = activeFightId();
    if (!fightId) return { ok: false, reason: "not_active" };

    const fight = state.snapshot().fightsById[fightId];
    if (!fight) return { ok: false, reason: "fight_not_found" };

    const fighterId = input.side === "RED" ? fight.redFighterId : fight.whiteFighterId;
    // --- fighterId IS ONLY EVER null FOR A BYE'S "WHITE" SIDE, AND A BYE CAN NEVER BE THE
    // ACTIVE FIGHT (IT'S CREATED DIRECTLY AS "finished", SO startFight ALWAYS REJECTS IT) —
    // THIS IS PURE TYPE-SAFETY DEFENCE, NOT A REACHABLE PATH. ---
    if (!fighterId) return { ok: false, reason: "scoring_not_allowed" };

    return record(fightId, fighterId);
  }

  return {
    view,
    applyDraw,
    loadCompetition: (competitionId) =>
      loadCompetition({ state, loadCompetitionFights: deps.loadCompetitionFights }, competitionId),
    openFight: (fightId) => startFight(useCaseDeps, fightId),
    closeFight,
    cancelActiveFight,
    validateActiveFight: finishActiveFight,
    forfeitActiveFight: finishActiveFight,
    recordIppon: (input) =>
      recordScore(input, (fightId, fighterId) =>
        recordIppon(useCaseDeps, fightId, fighterId, input.code),
      ),
    recordHansoku: (input) =>
      recordScore(input, (fightId, fighterId) => recordHansoku(useCaseDeps, fightId, fighterId)),
    removeScoreEvent: async (input) => {
      const fightId = activeFightId();
      if (!fightId) return { ok: false, reason: "not_active" };

      return removeScoreEvent(useCaseDeps, fightId, input.scoreEventId, input.type);
    },
  };
}
