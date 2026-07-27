import type { ReadonlyStore } from "@tanstack/store";
import type { CompetitionId } from "../../shared/competition-id.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import type { FightId } from "../../shared/fight-id.ts";
import type { IpponCode } from "../../shared/ippons.ts";
import type { ScoreEventId } from "../../shared/score-event-id.ts";
import type { Side } from "../../shared/side.ts";
import { cancelFight } from "./cancel-fight.use-case.ts";
import type { CommandResult } from "./command-result.ts";
import { finishFight } from "./finish-fight.use-case.ts";
import { loadCompetition } from "./load-competition.use-case.ts";
import { recordHansoku, recordIppon } from "./record-score-event.use-case.ts";
import { removeScoreEvent } from "./remove-score-event.use-case.ts";
import { startFight } from "./start-fight.use-case.ts";
import type { ScoreEventType } from "../domain/score-event.ts";
import type { ApplyDrawPort } from "../ports/apply-draw.port.ts";
import type { LoadCompetitionFightsPort } from "../ports/load-competition-fights.port.ts";
import type { SaveFightResultPort } from "../ports/save-fight-result.port.ts";
import type { GeneratedFightsData } from "../ports/save-generated-fights.port.ts";
import { createActiveCompetitionView } from "../state/active-competition-view.ts";
import type { ActiveCompetitionView } from "../state/active-competition-view.ts";
import { createCompetitionState } from "../state/competition-state.ts";

export type { ActiveCompetitionView } from "../state/active-competition-view.ts";

export interface ActiveCompetitionFacadeDeps {
  readonly loadCompetitionFights: LoadCompetitionFightsPort;
  readonly saveFightResult: SaveFightResultPort;
}

export interface ActiveCompetitionFacade extends ApplyDrawPort {
  readonly view: ReadonlyStore<ActiveCompetitionView>;
  loadCompetition(competitionId: CompetitionId): Promise<void>;
  openFight(fightId: FightId): Promise<CommandResult>;
  closeFight(): void;
  cancelActiveFight(): Promise<CommandResult>;
  validateActiveFight(): Promise<CommandResult>;
  forfeitActiveFight(): Promise<CommandResult>;
  recordIppon(input: { side: Side; code: IpponCode }): Promise<CommandResult>;
  recordHansoku(input: { side: Side }): Promise<CommandResult>;
  removeScoreEvent(input: {
    scoreEventId: ScoreEventId;
    type: ScoreEventType;
  }): Promise<CommandResult>;
}

export function createActiveCompetitionFacade(
  deps: ActiveCompetitionFacadeDeps,
): ActiveCompetitionFacade {
  const state = createCompetitionState();
  const view = createActiveCompetitionView(state);
  const useCaseDeps = { state, saveFightResult: deps.saveFightResult };

  function activeFightId(): FightId | undefined {
    return state.snapshot().activeFightId ?? undefined;
  }

  function applyDraw(data: GeneratedFightsData): void {
    const maxScoreEventId = data.fights
      .flatMap((fight) => fight.scoreEvents)
      .reduce((max, scoreEvent) => Math.max(max, scoreEvent.id), 0);

    state.replace({ ...data, nextScoreEventId: maxScoreEventId + 1 });
  }

  function closeFight(): void {
    state.setActiveFightId(null);
  }

  async function cancelActiveFight(): Promise<CommandResult> {
    const fightId = activeFightId();
    if (!fightId) return { ok: false, reason: "not_active" };

    return cancelFight(useCaseDeps, fightId);
  }

  async function finishActiveFight(): Promise<CommandResult> {
    const fightId = activeFightId();
    if (!fightId) return { ok: false, reason: "not_active" };

    return finishFight(useCaseDeps, fightId);
  }

  async function recordScore(
    input: { side: Side },
    record: (fightId: FightId, fighterId: FighterId) => Promise<CommandResult>,
  ): Promise<CommandResult> {
    const fightId = activeFightId();
    if (!fightId) return { ok: false, reason: "not_active" };

    const fight = state.snapshot().fightsById[fightId];
    if (!fight) return { ok: false, reason: "fight_not_found" };

    const fighterId = input.side === "RED" ? fight.redFighterId : fight.whiteFighterId;
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
