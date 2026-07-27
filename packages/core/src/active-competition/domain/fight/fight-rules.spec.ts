import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../../shared/fight-status.ts";
import { makeFightRecord } from "../../__test__/fixtures.ts";
import { cancelFight, finishFight, startFight } from "./fight-rules.ts";

describe("Fight rules", () => {
  describe("startFight", () => {
    it("starts a Waiting fight without mutating the source record", () => {
      const fight = makeFightRecord();

      const result = startFight(fight);

      expect(result).toEqual({ ...fight, status: FightStatus.InProgress });
      expect(fight.status).toBe(FightStatus.Waiting);
    });

    it("rejects an InProgress or Finished fight", () => {
      expect(startFight(makeFightRecord({ status: FightStatus.InProgress }))).toEqual({
        reason: "illegal_transition",
      });
      expect(startFight(makeFightRecord({ status: FightStatus.Finished }))).toEqual({
        reason: "illegal_transition",
      });
    });
  });

  describe("cancelFight", () => {
    it("returns an InProgress fight to Waiting", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      expect(cancelFight(fight)).toEqual({ ...fight, status: FightStatus.Waiting });
      expect(fight.status).toBe(FightStatus.InProgress);
    });

    it("rejects a Waiting or Finished fight", () => {
      expect(cancelFight(makeFightRecord())).toEqual({ reason: "illegal_transition" });
      expect(cancelFight(makeFightRecord({ status: FightStatus.Finished }))).toEqual({
        reason: "illegal_transition",
      });
    });
  });

  describe("finishFight", () => {
    it("finishes an InProgress fight", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      expect(finishFight(fight)).toEqual({ ...fight, status: FightStatus.Finished });
      expect(fight.status).toBe(FightStatus.InProgress);
    });

    it("rejects a Waiting or Finished fight", () => {
      expect(finishFight(makeFightRecord())).toEqual({ reason: "illegal_transition" });
      expect(finishFight(makeFightRecord({ status: FightStatus.Finished }))).toEqual({
        reason: "illegal_transition",
      });
    });
  });
});
