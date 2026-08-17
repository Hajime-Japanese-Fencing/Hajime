import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../../shared/fight-status.ts";
import { IpponCode } from "../../../shared/ippons.ts";
import { makeScoreEventId } from "../../../shared/score-event-id.ts";
import { fighterRed, makeFightRecord } from "../../__test__/fixtures.ts";
import { cancelFight, finishFight, startFight } from "./fight-rules.ts";

describe("Fight state transitions", () => {
  describe("startFight", () => {
    it("should start a waiting fight without changing the original fight", () => {
      const fight = makeFightRecord();

      const result = startFight(fight);

      expect(result).toEqual({ ...fight, status: FightStatus.InProgress });
      expect(fight.status).toBe(FightStatus.Waiting);
    });

    it("should reject a fight that has already started or finished", () => {
      expect(startFight(makeFightRecord({ status: FightStatus.InProgress }))).toEqual({
        reason: "illegal_transition",
      });
      expect(startFight(makeFightRecord({ status: FightStatus.Finished }))).toEqual({
        reason: "illegal_transition",
      });
    });
  });

  describe("cancelFight", () => {
    it("should return an in-progress fight to waiting", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      expect(cancelFight(fight)).toEqual({ ...fight, status: FightStatus.Waiting });
      expect(fight.status).toBe(FightStatus.InProgress);
    });

    it("should discard any score events recorded so far", () => {
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [
          {
            id: makeScoreEventId(1),
            fighterId: fighterRed,
            type: "ippon",
            code: IpponCode.Men,
            firstBlood: true,
          },
        ],
      });

      const result = cancelFight(fight);

      expect(result).toEqual({ ...fight, status: FightStatus.Waiting, scoreEvents: [] });
      expect(fight.scoreEvents).toHaveLength(1);
    });

    it("should reject a waiting or finished fight", () => {
      expect(cancelFight(makeFightRecord())).toEqual({ reason: "illegal_transition" });
      expect(cancelFight(makeFightRecord({ status: FightStatus.Finished }))).toEqual({
        reason: "illegal_transition",
      });
    });
  });

  describe("finishFight", () => {
    it("should finish an in-progress fight", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      expect(finishFight(fight)).toEqual({ ...fight, status: FightStatus.Finished });
      expect(fight.status).toBe(FightStatus.InProgress);
    });

    it("should reject a waiting or finished fight", () => {
      expect(finishFight(makeFightRecord())).toEqual({ reason: "illegal_transition" });
      expect(finishFight(makeFightRecord({ status: FightStatus.Finished }))).toEqual({
        reason: "illegal_transition",
      });
    });
  });
});
