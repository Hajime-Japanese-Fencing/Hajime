import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../../shared/fight-status.ts";
import { makeFighterId } from "../../../shared/fighter-id.ts";
import { IpponCode } from "../../../shared/ippons.ts";
import { makeScoreEventId } from "../../../shared/score-event-id.ts";
import { fighterRed, fighterWhite, makeFightRecord } from "../../__test__/fixtures.ts";
import { recordHansoku, recordIppon, removeScoreEvent } from "./score-event-rules.ts";

describe("Fight scoring", () => {
  describe("recordIppon", () => {
    it("should record an ippon for a competitor and mark the first ippon as firstBlood", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      const result = recordIppon(fight, fighterRed, IpponCode.Men, makeScoreEventId(1));

      expect(result).toEqual({
        ...fight,
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
      expect(fight.scoreEvents).toEqual([]);
    });

    it("should restore firstBlood when the recorded score is inconsistent", () => {
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [
          {
            id: makeScoreEventId(1),
            fighterId: fighterRed,
            type: "ippon",
            code: IpponCode.Men,
            firstBlood: false,
          },
        ],
      });

      const result = recordIppon(fight, fighterWhite, IpponCode.Kote, makeScoreEventId(2));

      expect(result).toEqual({
        ...fight,
        scoreEvents: [
          { ...fight.scoreEvents[0], firstBlood: true },
          {
            id: makeScoreEventId(2),
            fighterId: fighterWhite,
            type: "ippon",
            code: IpponCode.Kote,
            firstBlood: false,
          },
        ],
      });
    });

    it("should reject scoring a fight that is not in progress", () => {
      expect(
        recordIppon(makeFightRecord(), fighterRed, IpponCode.Men, makeScoreEventId(1)),
      ).toEqual({ reason: "scoring_not_allowed" });
      expect(
        recordIppon(
          makeFightRecord({ status: FightStatus.Finished }),
          fighterRed,
          IpponCode.Men,
          makeScoreEventId(1),
        ),
      ).toEqual({ reason: "scoring_not_allowed" });
    });

    it("should reject an ippon for a competitor outside the fight", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      expect(
        recordIppon(fight, makeFighterId("other"), IpponCode.Men, makeScoreEventId(1)),
      ).toEqual({
        reason: "fighter_not_in_fight",
      });
    });
  });

  describe("recordHansoku", () => {
    it("records a hansoku for a fight participant", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      const result = recordHansoku(fight, fighterWhite, makeScoreEventId(1));

      expect(result).toEqual({
        ...fight,
        scoreEvents: [
          {
            id: makeScoreEventId(1),
            fighterId: fighterWhite,
            type: "hansoku",
            code: "Δ",
            firstBlood: false,
          },
        ],
      });
    });

    it("rejects a hansoku for a fighter who does not take part in the fight", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      expect(recordHansoku(fight, makeFighterId("other"), makeScoreEventId(1))).toEqual({
        reason: "fighter_not_in_fight",
      });
    });
  });

  describe("removeScoreEvent", () => {
    it("removes an event of the expected type and recalculates firstBlood", () => {
      const firstIppon = {
        id: makeScoreEventId(1),
        fighterId: fighterRed,
        type: "ippon" as const,
        code: IpponCode.Men,
        firstBlood: true,
      };
      const secondIppon = {
        id: makeScoreEventId(2),
        fighterId: fighterWhite,
        type: "ippon" as const,
        code: IpponCode.Kote,
        firstBlood: false,
      };
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [firstIppon, secondIppon],
      });

      const result = removeScoreEvent(fight, firstIppon.id, "ippon");

      expect(result).toEqual({
        ...fight,
        scoreEvents: [{ ...secondIppon, firstBlood: true }],
      });
      expect(fight.scoreEvents).toEqual([firstIppon, secondIppon]);
    });

    it("rejects removal when the score event type does not match", () => {
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [
          {
            id: makeScoreEventId(1),
            fighterId: fighterRed,
            type: "hansoku",
            code: "Δ",
            firstBlood: false,
          },
        ],
      });

      expect(removeScoreEvent(fight, makeScoreEventId(1), "ippon")).toEqual({
        reason: "score_event_type_mismatch",
      });
    });

    it("rejects an unknown score event and removals outside an active fight", () => {
      const inProgressFight = makeFightRecord({ status: FightStatus.InProgress });

      expect(removeScoreEvent(inProgressFight, makeScoreEventId(1), "ippon")).toEqual({
        reason: "score_event_not_found",
      });
      expect(removeScoreEvent(makeFightRecord(), makeScoreEventId(1), "ippon")).toEqual({
        reason: "scoring_not_allowed",
      });
    });
  });
});
