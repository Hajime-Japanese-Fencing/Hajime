import { describe, it, expect } from "vite-plus/test";
import { FightStatus } from "../fight-status.type.ts";
import { IpponCode } from "../shared/ippons.ts";
import { createActiveCompetitionStore } from "./active-competition.store.ts";
import type { FightRecord } from "./domain/fight-record.ts";
import { FakeSaveFightResultAdapter } from "./__test__/fake-save-fight-result.adapter.ts";
import {
  makeFightRecord,
  makePoolRecord,
  fightId1,
  fightId2,
  fighterRed,
  fighterWhite,
  poolId1,
} from "./__test__/fixtures.ts";
import { FakeSaveGeneratedFightsAdapter } from "./__test__/fake-save-generated-fights.adapter.ts";
import { makeCompetitionId } from "../shared/competition-id.ts";

/**
 * @todo Splitter en plusieurs fichiers de tests
 * On a les tests de tous les stores ici
 */

function makeActiveCompetition() {
  const saveAdapter = new FakeSaveFightResultAdapter();
  const saveGeneratedAdapter = new FakeSaveGeneratedFightsAdapter();
  const activeCompetition = createActiveCompetitionStore({
    saveGeneratedFights: saveGeneratedAdapter,
    saveFightResult: saveAdapter,
  });
  return { activeCompetition, saveAdapter, saveGeneratedAdapter };
}

function loadOneWaitingFight(activeCompetition: ReturnType<typeof createActiveCompetitionStore>) {
  activeCompetition.loadFights([makePoolRecord()], [makeFightRecord()]);
}

// ---------------------------------------------------------------------------

describe("ActiveCompetition — loadFights", () => {
  it("populates pools and fights in the store", () => {
    const { activeCompetition } = makeActiveCompetition();
    const pool = makePoolRecord();
    const fight = makeFightRecord();

    activeCompetition.loadFights([pool], [fight]);

    expect(activeCompetition.pools.state[poolId1]).toBeDefined();
    expect(activeCompetition.fights.state[fightId1]).toBeDefined();
    expect(activeCompetition.activeFightId.state).toBeNull();
  });

  it("initialises nextScoreEventId above any existing score event ids", () => {
    const { activeCompetition } = makeActiveCompetition();
    const fight = makeFightRecord({
      scoreEvents: [
        { id: 5 as any, fighterId: fighterRed, type: "ippon", code: "M", firstBlood: true },
      ],
    });
    activeCompetition.loadFights([makePoolRecord()], [fight]);

    expect(activeCompetition.nextScoreEventId.state).toBe(6);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — openFight", () => {
  it("sets activeFightId", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    activeCompetition.openFight(fightId1);

    expect(activeCompetition.activeFightId.state).toBe(fightId1);
  });

  it("transitions a Waiting fight to InProgress", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    activeCompetition.openFight(fightId1);

    expect(activeCompetition.fights.state[fightId1].status).toBe(FightStatus.InProgress);
  });

  it("persists the status transition via the port", () => {
    const { activeCompetition, saveAdapter } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    activeCompetition.openFight(fightId1);

    expect(saveAdapter.getStatus(fightId1)).toBe(FightStatus.InProgress);
  });

  it("does not change status if fight is already InProgress", () => {
    const { activeCompetition } = makeActiveCompetition();
    activeCompetition.loadFights(
      [makePoolRecord()],
      [makeFightRecord({ status: FightStatus.InProgress })],
    );

    activeCompetition.openFight(fightId1);

    expect(activeCompetition.fights.state[fightId1].status).toBe(FightStatus.InProgress);
  });

  it("guard — is a no-op if another fight is already InProgress", () => {
    const { activeCompetition } = makeActiveCompetition();
    activeCompetition.loadFights(
      [makePoolRecord({ fightIds: [fightId1, fightId2] })],
      [
        makeFightRecord({ id: fightId1, status: FightStatus.InProgress }),
        makeFightRecord({ id: fightId2 }),
      ],
    );
    activeCompetition.openFight(fightId1);

    activeCompetition.openFight(fightId2);

    expect(activeCompetition.activeFightId.state).toBe(fightId1);
    expect(activeCompetition.fights.state[fightId2].status).toBe(FightStatus.Waiting);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — closeFight", () => {
  it("clears activeFightId without changing fight status", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.openFight(fightId1);

    activeCompetition.closeFight();

    expect(activeCompetition.activeFightId.state).toBeNull();
    expect(activeCompetition.fights.state[fightId1].status).toBe(FightStatus.InProgress);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — cancelFight", () => {
  it("reverts fight to Waiting and clears activeFightId", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.openFight(fightId1);

    activeCompetition.cancelFight(fightId1);

    expect(activeCompetition.activeFightId.state).toBeNull();
    expect(activeCompetition.fights.state[fightId1].status).toBe(FightStatus.Waiting);
  });

  it("persists the revert via the port", () => {
    const { activeCompetition, saveAdapter } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.openFight(fightId1);

    activeCompetition.cancelFight(fightId1);

    expect(saveAdapter.getStatus(fightId1)).toBe(FightStatus.Waiting);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — validateFight", () => {
  it("marks fight as Finished and clears activeFightId", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.openFight(fightId1);

    activeCompetition.validateFight(fightId1);

    expect(activeCompetition.activeFightId.state).toBeNull();
    expect(activeCompetition.fights.state[fightId1].status).toBe(FightStatus.Finished);
  });

  it("persists via the port", () => {
    const { activeCompetition, saveAdapter } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.openFight(fightId1);

    activeCompetition.validateFight(fightId1);

    expect(saveAdapter.getStatus(fightId1)).toBe(FightStatus.Finished);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — forfeitFight", () => {
  it("marks fight as Finished and clears activeFightId", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.openFight(fightId1);

    activeCompetition.forfeitFight(fightId1);

    expect(activeCompetition.activeFightId.state).toBeNull();
    expect(activeCompetition.fights.state[fightId1].status).toBe(FightStatus.Finished);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — assignIppon", () => {
  it("adds a score event with the correct fighter and code", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    activeCompetition.assignIppon(fightId1, fighterRed, IpponCode.Men);

    const events = activeCompetition.fights.state[fightId1].scoreEvents;
    expect(events).toHaveLength(1);
    expect(events[0].fighterId).toBe(fighterRed);
    expect(events[0].code).toBe(IpponCode.Men);
    expect(events[0].type).toBe("ippon");
  });

  it("marks the first ippon as firstBlood", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    activeCompetition.assignIppon(fightId1, fighterRed, IpponCode.Men);

    expect(activeCompetition.fights.state[fightId1].scoreEvents[0].firstBlood).toBe(true);
  });

  it("does not mark subsequent ippons as firstBlood", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    activeCompetition.assignIppon(fightId1, fighterRed, IpponCode.Men);
    activeCompetition.assignIppon(fightId1, fighterWhite, IpponCode.Kote);

    expect(activeCompetition.fights.state[fightId1].scoreEvents[1].firstBlood).toBe(false);
  });

  it("persists score events via the port", () => {
    const { activeCompetition, saveAdapter } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    activeCompetition.assignIppon(fightId1, fighterRed, IpponCode.Men);

    expect(saveAdapter.getScoreEvents(fightId1)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — removeIppon", () => {
  it("removes the score event by id", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.assignIppon(fightId1, fighterRed, IpponCode.Men);
    const eventId = activeCompetition.fights.state[fightId1].scoreEvents[0].id;

    activeCompetition.removeIppon(fightId1, eventId);

    expect(activeCompetition.fights.state[fightId1].scoreEvents).toHaveLength(0);
  });

  it("persists the removal via the port", () => {
    const { activeCompetition, saveAdapter } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.assignIppon(fightId1, fighterRed, IpponCode.Men);
    const eventId = activeCompetition.fights.state[fightId1].scoreEvents[0].id;

    activeCompetition.removeIppon(fightId1, eventId);

    expect(saveAdapter.getScoreEvents(fightId1)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — assignHansoku", () => {
  it("adds a hansoku score event", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    activeCompetition.assignHansoku(fightId1, fighterWhite);

    const events = activeCompetition.fights.state[fightId1].scoreEvents;
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("hansoku");
    expect(events[0].code).toBe("Δ");
    expect(events[0].fighterId).toBe(fighterWhite);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — removeHansoku", () => {
  it("removes the hansoku score event by id", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.assignHansoku(fightId1, fighterWhite);
    const eventId = activeCompetition.fights.state[fightId1].scoreEvents[0].id;

    activeCompetition.removeHansoku(fightId1, eventId);

    expect(activeCompetition.fights.state[fightId1].scoreEvents).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — derived activeFight", () => {
  it("returns undefined when no fight is active", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);

    expect(activeCompetition.activeFight.state).toBeUndefined();
  });

  it("returns the active fight record", () => {
    const { activeCompetition } = makeActiveCompetition();
    loadOneWaitingFight(activeCompetition);
    activeCompetition.openFight(fightId1);

    expect(activeCompetition.activeFight.state?.id).toBe(fightId1);
  });

  it("updates reactively when activeFightId changes", () => {
    const { activeCompetition } = makeActiveCompetition();
    activeCompetition.loadFights(
      [makePoolRecord({ fightIds: [fightId1, fightId2] })],
      [makeFightRecord({ id: fightId1 }), makeFightRecord({ id: fightId2 })],
    );

    let observed: FightRecord | undefined;
    const subscription = activeCompetition.activeFight.subscribe(
      (fight: FightRecord | undefined) => {
        observed = fight;
      },
    );

    activeCompetition.openFight(fightId1);
    expect(observed?.id).toBe(fightId1);

    activeCompetition.openFight(fightId2);
    expect(observed?.id).toBe(fightId1); // guarded because fight1 is InProgress

    subscription.unsubscribe();
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — derived poolFights", () => {
  it("returns fights belonging to a pool in order", () => {
    const { activeCompetition } = makeActiveCompetition();
    const pool = makePoolRecord({ fightIds: [fightId1, fightId2] });
    const fight1 = makeFightRecord({ id: fightId1 });
    const fight2 = makeFightRecord({ id: fightId2 });
    activeCompetition.loadFights([pool], [fight1, fight2]);

    const derived = activeCompetition.poolFights(poolId1);

    expect(derived.state).toHaveLength(2);
    expect(derived.state[0].id).toBe(fightId1);
    expect(derived.state[1].id).toBe(fightId2);
  });

  it("reacts to fight updates", () => {
    const { activeCompetition } = makeActiveCompetition();
    activeCompetition.loadFights([makePoolRecord()], [makeFightRecord()]);

    const derived = activeCompetition.poolFights(poolId1);
    let observed = derived.state.length;
    const subscription = derived.subscribe((fights: ReadonlyArray<FightRecord>) => {
      observed = fights.length;
    });

    activeCompetition.openFight(fightId1);

    expect(observed).toBe(1);
    expect(derived.state[0].status).toBe(FightStatus.InProgress);

    subscription.unsubscribe();
  });
});

// ---------------------------------------------------------------------------

describe("ActiveCompetition — saveGeneratedFights", () => {
  it("persists the generated pools and fights through the port", () => {
    const { activeCompetition, saveGeneratedAdapter } = makeActiveCompetition();
    const competitionId = makeCompetitionId("competition 1");

    const data = { pools: [makePoolRecord()], fights: [makeFightRecord()] };

    activeCompetition.saveGeneratedFights(competitionId, data);

    expect(saveGeneratedAdapter.getGeneratedFights(competitionId)).toEqual(data);
  });

  it("sends the pool data to the store", () => {
    const { activeCompetition } = makeActiveCompetition();
    const competitionId = makeCompetitionId("competition 1");

    const data = { pools: [makePoolRecord()], fights: [makeFightRecord()] };

    const expectedPools = {
      "1": data.pools[0],
    };

    activeCompetition.saveGeneratedFights(competitionId, data);

    expect(activeCompetition.pools.state).toEqual(expectedPools);
  });

  it("sends the fights data to the store", () => {
    const { activeCompetition } = makeActiveCompetition();
    const competitionId = makeCompetitionId("competition 1");

    const data = { pools: [makePoolRecord()], fights: [makeFightRecord()] };

    const expectedFights = {
      "1": data.fights[0],
    };

    activeCompetition.saveGeneratedFights(competitionId, data);

    expect(activeCompetition.fights.state).toEqual(expectedFights);
  });
});
