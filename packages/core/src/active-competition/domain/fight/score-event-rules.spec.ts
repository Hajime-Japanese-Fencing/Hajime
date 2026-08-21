import { describe, expect, it } from "vite-plus/test";
import { FightStatus } from "../../../shared/fight-status.ts";
import { makeFighterId } from "../../../shared/fighter-id.ts";
import { IpponCode } from "../../../shared/ippons.ts";
import { makeScoreEventId } from "../../../shared/score-event-id.ts";
import type { FightRecord } from "../../../shared/fight-record.ts";
import type { ScoreEvent } from "../../../shared/score-event.ts";
import { fighterRed, fighterWhite, makeFightRecord } from "../../__test__/fixtures.ts";
import { isRejection } from "./fight-rules.ts";
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

    it("should stop allowing to assign an Ippon to a fighter after he has already scored 2", () => {
      const fighterId = makeFighterId("other");
      const fight = makeFightRecord({ redFighterId: fighterId, status: FightStatus.InProgress });

      const afterFirst = recordIppon(fight, fighterId, IpponCode.Men, makeScoreEventId(1));
      expect(isRejection(afterFirst)).toBe(false);

      const afterSecond = recordIppon(
        afterFirst as FightRecord,
        fighterId,
        IpponCode.Kote,
        makeScoreEventId(2),
      );
      expect(isRejection(afterSecond)).toBe(false);
      expect((afterSecond as FightRecord).scoreEvents).toHaveLength(2);

      expect(
        recordIppon(afterSecond as FightRecord, fighterId, IpponCode.Men, makeScoreEventId(3)),
      ).toEqual({ reason: "scoring_limit_reached" });
    });

    it("prioritizes the not-in-progress rejection over the scoring limit when both apply", () => {
      const fighterId = makeFighterId("other");
      const fight = makeFightRecord({
        redFighterId: fighterId,
        status: FightStatus.Finished,
        scoreEvents: [
          {
            id: makeScoreEventId(1),
            fighterId,
            type: "ippon",
            code: IpponCode.Men,
            firstBlood: true,
          },
          {
            id: makeScoreEventId(2),
            fighterId,
            type: "ippon",
            code: IpponCode.Kote,
            firstBlood: false,
          },
        ],
      });

      expect(recordIppon(fight, fighterId, IpponCode.Do, makeScoreEventId(3))).toEqual({
        reason: "scoring_not_allowed",
      });
    });

    it("allows scoring again after removing one of the two ippons that reached the limit", () => {
      const fighterId = makeFighterId("other");
      const fight = makeFightRecord({
        redFighterId: fighterId,
        status: FightStatus.InProgress,
        scoreEvents: [
          {
            id: makeScoreEventId(1),
            fighterId,
            type: "ippon",
            code: IpponCode.Men,
            firstBlood: true,
          },
          {
            id: makeScoreEventId(2),
            fighterId,
            type: "ippon",
            code: IpponCode.Kote,
            firstBlood: false,
          },
        ],
      });

      expect(recordIppon(fight, fighterId, IpponCode.Do, makeScoreEventId(3))).toEqual({
        reason: "scoring_limit_reached",
      });

      const corrected = removeScoreEvent(fight, makeScoreEventId(2), "ippon") as FightRecord;

      expect(
        isRejection(recordIppon(corrected, fighterId, IpponCode.Do, makeScoreEventId(3))),
      ).toBe(false);
    });

    it("reaches the limit with one real ippon and one hansoku-awarded ippon combined", () => {
      // --- A FIGHTER CAN HIT THE 2-IPPON LIMIT THROUGH TWO DIFFERENT ROUTES AT ONCE: ONE
      // IPPON SCORED BY TECHNIQUE, AND ONE AUTO-AWARDED BECAUSE THE OPPONENT RACKED UP TWO
      // HANSOKU. scoreLimitReached SHOULDN'T CARE WHERE EACH ippon-TYPE EVENT CAME FROM. ---
      const fighterId = makeFighterId("other");
      const opponentId = fighterWhite;
      const fight = makeFightRecord({
        redFighterId: fighterId,
        whiteFighterId: opponentId,
        status: FightStatus.InProgress,
        scoreEvents: [
          {
            id: makeScoreEventId(1),
            fighterId,
            type: "ippon",
            code: IpponCode.Men,
            firstBlood: true,
          },
          {
            id: makeScoreEventId(2),
            fighterId: opponentId,
            type: "hansoku",
            code: "Δ",
            firstBlood: false,
          },
          {
            id: makeScoreEventId(3),
            fighterId: opponentId,
            type: "hansoku",
            code: "Δ",
            firstBlood: false,
          },
          {
            id: makeScoreEventId(4),
            fighterId,
            type: "ippon",
            code: IpponCode.Ippon,
            firstBlood: false,
          },
        ],
      });

      expect(recordIppon(fight, opponentId, IpponCode.Kote, makeScoreEventId(5))).toEqual({
        reason: "scoring_limit_reached",
      });
    });

    it("should stop allowing to assign an Ippon to a fighter after another has already scored 2", () => {
      const redFighterId = makeFighterId("red");
      const whiteFighterId = makeFighterId("white");
      const fight = makeFightRecord({
        redFighterId: redFighterId,
        whiteFighterId: whiteFighterId,
        status: FightStatus.InProgress,
      });

      const afterFirst = recordIppon(
        fight,
        redFighterId,
        IpponCode.Men,
        makeScoreEventId(1),
      ) as FightRecord;
      const afterSecond = recordIppon(
        afterFirst,
        redFighterId,
        IpponCode.Kote,
        makeScoreEventId(2),
      ) as FightRecord;

      expect(recordIppon(afterSecond, whiteFighterId, IpponCode.Men, makeScoreEventId(3))).toEqual({
        reason: "scoring_limit_reached",
      });
    });

    it("should allow to assign an Ippon to a fighter after another has already scored 1", () => {
      const redFighterId = makeFighterId("red");
      const whiteFighterId = makeFighterId("white");
      const fight = makeFightRecord({
        redFighterId: redFighterId,
        whiteFighterId: whiteFighterId,
        status: FightStatus.InProgress,
      });

      const afterFirst = recordIppon(
        fight,
        redFighterId,
        IpponCode.Men,
        makeScoreEventId(1),
      ) as FightRecord;

      const result = recordIppon(
        afterFirst,
        whiteFighterId,
        IpponCode.Men,
        makeScoreEventId(2),
      ) as FightRecord;

      expect(result.scoreEvents.length).toBe(2);
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

    it("rejects recording a hansoku for either fighter once a fighter has already scored 2 ippons", () => {
      // --- scoreLimitReached LOOKS AT THE WHOLE MATCH, NOT JUST THE FIGHTER PASSED IN, SO
      // ONCE ONE FIGHTER HAS SCORED SHOBU-ARI (2 IPPONS) THE MATCH SHOULD STOP ACCEPTING ANY
      // FURTHER SCORE EVENT — INCLUDING A HANSOKU AGAINST THE *OTHER*, STILL-UNDER-THE-LIMIT
      // FIGHTER. ---
      const fighterId = makeFighterId("other");
      const fight = makeFightRecord({
        redFighterId: fighterId,
        status: FightStatus.InProgress,
        scoreEvents: [
          {
            id: makeScoreEventId(1),
            fighterId,
            type: "ippon",
            code: IpponCode.Men,
            firstBlood: true,
          },
          {
            id: makeScoreEventId(2),
            fighterId,
            type: "ippon",
            code: IpponCode.Kote,
            firstBlood: false,
          },
        ],
      });

      expect(recordHansoku(fight, fighterWhite, makeScoreEventId(3))).toEqual({
        reason: "scoring_limit_reached",
      });
      expect(recordHansoku(fight, fighterId, makeScoreEventId(3))).toEqual({
        reason: "scoring_limit_reached",
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

  // --- A FIGHTER WHO ACCUMULATES TWO HANSOKU AUTOMATICALLY GIVES THEIR OPPONENT AN IPPON.
  // THE AUTO-AWARDED IPPON IS TAGGED WITH IpponCode.Ippon ("I") RATHER THAN A NAMED STRIKE
  // (M/K/D/T), SINCE IT WASN'T SCORED BY A TECHNIQUE — THAT'S THE MARKER THAT LETS IT BE
  // TOLD APART FROM A "REAL" IPPON AND RECALCULATED/REMOVED AUTOMATICALLY RATHER THAN BY THE
  // REFEREE DIRECTLY. EVERY *PAIR* OF HANSOKU AWARDS ONE MORE IPPON (2 -> 1 IPPON, 4 -> 2
  // IPPONS, ETC), MIRRORING THE REAL KENDO RULE. ---
  describe("hansoku triggering an ippon for the opponent", () => {
    function hansokuEvent(id: number, fighterId = fighterWhite): ScoreEvent {
      return {
        id: makeScoreEventId(id),
        fighterId,
        type: "hansoku",
        code: "Δ",
        firstBlood: false,
      };
    }

    it("does not award an ippon on a fighter's first hansoku", () => {
      const fight = makeFightRecord({ status: FightStatus.InProgress });

      const result = recordHansoku(fight, fighterWhite, makeScoreEventId(1));

      expect(result).toEqual({
        ...fight,
        scoreEvents: [hansokuEvent(1)],
      });
    });

    it("awards an ippon to the opponent when a fighter receives their second hansoku", () => {
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [hansokuEvent(1)],
      });

      const result = recordHansoku(fight, fighterWhite, makeScoreEventId(2));

      expect(result).toEqual({
        ...fight,
        scoreEvents: [
          hansokuEvent(1),
          hansokuEvent(2),
          {
            id: makeScoreEventId(3),
            fighterId: fighterRed,
            type: "ippon",
            code: IpponCode.Ippon,
            firstBlood: true,
          },
        ],
      });
    });

    it("does not award a second ippon on a fighter's third hansoku", () => {
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [
          hansokuEvent(1),
          hansokuEvent(2),
          {
            id: makeScoreEventId(3),
            fighterId: fighterRed,
            type: "ippon",
            code: IpponCode.Ippon,
            firstBlood: true,
          },
        ],
      });

      const result = recordHansoku(fight, fighterWhite, makeScoreEventId(4));

      expect(result).toEqual({
        ...fight,
        scoreEvents: [...fight.scoreEvents, hansokuEvent(4)],
      });
    });

    it("awards a second ippon once a fighter accumulates four hansoku", () => {
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [
          hansokuEvent(1),
          hansokuEvent(2),
          {
            id: makeScoreEventId(3),
            fighterId: fighterRed,
            type: "ippon",
            code: IpponCode.Ippon,
            firstBlood: true,
          },
          hansokuEvent(4),
        ],
      });

      const result = recordHansoku(fight, fighterWhite, makeScoreEventId(5));

      expect(result).toEqual({
        ...fight,
        scoreEvents: [
          ...fight.scoreEvents,
          hansokuEvent(5),
          {
            id: makeScoreEventId(6),
            fighterId: fighterRed,
            type: "ippon",
            code: IpponCode.Ippon,
            firstBlood: false,
          },
        ],
      });
    });

    it("removes the opponent's auto-awarded ippon when a fighter's hansoku count drops back below two", () => {
      const autoIppon: ScoreEvent = {
        id: makeScoreEventId(3),
        fighterId: fighterRed,
        type: "ippon",
        code: IpponCode.Ippon,
        firstBlood: true,
      };
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [hansokuEvent(1), hansokuEvent(2), autoIppon],
      });

      const result = removeScoreEvent(fight, makeScoreEventId(2), "hansoku");

      expect(result).toEqual({
        ...fight,
        scoreEvents: [hansokuEvent(1)],
      });
    });

    it("keeps the auto-awarded ippon when a fighter still has two hansoku left after removing an extra one", () => {
      const firstAutoIppon: ScoreEvent = {
        id: makeScoreEventId(3),
        fighterId: fighterRed,
        type: "ippon",
        code: IpponCode.Ippon,
        firstBlood: true,
      };
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [hansokuEvent(1), hansokuEvent(2), firstAutoIppon, hansokuEvent(4)],
      });

      const result = removeScoreEvent(fight, makeScoreEventId(4), "hansoku");

      expect(result).toEqual({
        ...fight,
        scoreEvents: [hansokuEvent(1), hansokuEvent(2), firstAutoIppon],
      });
    });

    it("recalculates firstBlood when the auto-awarded ippon is removed", () => {
      const autoIppon: ScoreEvent = {
        id: makeScoreEventId(3),
        fighterId: fighterRed,
        type: "ippon",
        code: IpponCode.Ippon,
        firstBlood: true,
      };
      const laterIppon: ScoreEvent = {
        id: makeScoreEventId(4),
        fighterId: fighterWhite,
        type: "ippon",
        code: IpponCode.Men,
        firstBlood: false,
      };
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [hansokuEvent(1), hansokuEvent(2), autoIppon, laterIppon],
      });

      const result = removeScoreEvent(fight, makeScoreEventId(2), "hansoku");

      expect(result).toEqual({
        ...fight,
        scoreEvents: [hansokuEvent(1), { ...laterIppon, firstBlood: true }],
      });
    });

    it("removes the auto-awarded ippon rather than a real ippon the opponent scored by technique", () => {
      // --- CHRONOLOGY: fighterWhite's 1st HANSOKU, THEN fighterRed SCORES A REAL MEN
      // (BECOMING firstBlood), THEN fighterWhite's 2nd HANSOKU TRIGGERS THE AUTO IPPON. A
      // NAIVE "FIRST ippon-TYPE EVENT FOR THE OPPONENT" LOOKUP WOULD PICK THE MEN INSTEAD OF
      // THE AUTO IPPON, WRONGLY STRIPPING A POINT fighterRed ACTUALLY EARNED. ---
      const realMen: ScoreEvent = {
        id: makeScoreEventId(2),
        fighterId: fighterRed,
        type: "ippon",
        code: IpponCode.Men,
        firstBlood: true,
      };
      const autoIppon: ScoreEvent = {
        id: makeScoreEventId(4),
        fighterId: fighterRed,
        type: "ippon",
        code: IpponCode.Ippon,
        firstBlood: false,
      };
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [hansokuEvent(1), realMen, hansokuEvent(3), autoIppon],
      });

      const result = removeScoreEvent(fight, makeScoreEventId(3), "hansoku");

      expect(result).toEqual({
        ...fight,
        scoreEvents: [hansokuEvent(1), realMen],
      });
    });

    it("keeps firstBlood on the first auto-awarded ippon rather than switching it to a later real ippon", () => {
      // --- fighterWhite RACKS UP FOUR HANSOKU (TWO AUTO IPPONS FOR fighterRed ALONG THE
      // WAY), AND ALSO SCORES A REAL MEN OF THEIR OWN IN BETWEEN. THE VERY FIRST SCORE OF THE
      // FIGHT IS fighterRed's FIRST AUTO IPPON, SO IT HOLDS firstBlood. REMOVING THE LAST
      // HANSOKU (BACK DOWN TO THREE) SHOULD DROP THE *SECOND* AUTO IPPON — THE ONE TIED TO
      // THAT 4TH HANSOKU — AND LEAVE firstBlood WHERE IT WAS, NOT SLIDE IT ONTO THE MEN. IF
      // THE IMPLEMENTATION INSTEAD REMOVES THE *FIRST* AUTO IPPON IT FINDS, firstBlood WOULD
      // INCORRECTLY JUMP TO THE MEN ONCE IT RECALCULATES. ---
      const firstAutoIppon: ScoreEvent = {
        id: makeScoreEventId(3),
        fighterId: fighterRed,
        type: "ippon",
        code: IpponCode.Ippon,
        firstBlood: true,
      };
      const realMen: ScoreEvent = {
        id: makeScoreEventId(4),
        fighterId: fighterWhite,
        type: "ippon",
        code: IpponCode.Men,
        firstBlood: false,
      };
      const secondAutoIppon: ScoreEvent = {
        id: makeScoreEventId(7),
        fighterId: fighterRed,
        type: "ippon",
        code: IpponCode.Ippon,
        firstBlood: false,
      };
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [
          hansokuEvent(1),
          hansokuEvent(2),
          firstAutoIppon,
          realMen,
          hansokuEvent(5),
          hansokuEvent(6),
          secondAutoIppon,
        ],
      });

      const result = removeScoreEvent(fight, makeScoreEventId(6), "hansoku");

      expect(result).toEqual({
        ...fight,
        scoreEvents: [hansokuEvent(1), hansokuEvent(2), firstAutoIppon, realMen, hansokuEvent(5)],
      });
    });

    it("counts each fighter's hansoku separately when both fighters have some", () => {
      // --- fighterRed HAS TWO HANSOKU (TRIGGERING AN AUTO IPPON FOR fighterWhite), AND
      // fighterWhite SEPARATELY HAS A SINGLE HANSOKU OF THEIR OWN, WHICH SHOULDN'T COUNT
      // TOWARDS fighterRed's TALLY (OR VICE VERSA) WHEN WE FIGURE OUT WHETHER TO DROP THE
      // AUTO IPPON. ---
      const autoIppon: ScoreEvent = {
        id: makeScoreEventId(3),
        fighterId: fighterWhite,
        type: "ippon",
        code: IpponCode.Ippon,
        firstBlood: true,
      };
      const fight = makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [
          hansokuEvent(1, fighterRed),
          hansokuEvent(2, fighterRed),
          autoIppon,
          hansokuEvent(4, fighterWhite),
        ],
      });

      const result = removeScoreEvent(fight, makeScoreEventId(2), "hansoku");

      expect(result).toEqual({
        ...fight,
        scoreEvents: [hansokuEvent(1, fighterRed), hansokuEvent(4, fighterWhite)],
      });
    });
  });

  describe("scoring limit reached purely through accumulated hansoku", () => {
    // --- FOUR HANSOKU AGAINST fighterWhite AUTO-AWARD fighterRed TWO IPPONS (ONE PER PAIR),
    // WHICH ON ITS OWN HITS THE 2-IPPON LIMIT EVEN THOUGH fighterRed NEVER SCORED A "REAL"
    // IPPON BY TECHNIQUE. THIS IS THE SAME FINAL STATE AS THE "awards a second ippon once a
    // fighter accumulates four hansoku" TEST ABOVE. ---
    function hansokuEvent(id: number, fighterId = fighterWhite): ScoreEvent {
      return {
        id: makeScoreEventId(id),
        fighterId,
        type: "hansoku",
        code: "Δ",
        firstBlood: false,
      };
    }

    function fightAtHansokuAwardedLimit(): FightRecord {
      return makeFightRecord({
        status: FightStatus.InProgress,
        scoreEvents: [
          hansokuEvent(1),
          hansokuEvent(2),
          {
            id: makeScoreEventId(3),
            fighterId: fighterRed,
            type: "ippon",
            code: IpponCode.Ippon,
            firstBlood: true,
          },
          hansokuEvent(4),
          hansokuEvent(5),
          {
            id: makeScoreEventId(6),
            fighterId: fighterRed,
            type: "ippon",
            code: IpponCode.Ippon,
            firstBlood: false,
          },
        ],
      });
    }

    it("stops accepting ippons once two auto-awarded ippons reach the limit", () => {
      const fight = fightAtHansokuAwardedLimit();

      expect(recordIppon(fight, fighterWhite, IpponCode.Men, makeScoreEventId(7))).toEqual({
        reason: "scoring_limit_reached",
      });
    });

    it("stops accepting a hansoku for either fighter once two auto-awarded ippons reach the limit", () => {
      const fight = fightAtHansokuAwardedLimit();

      expect(recordHansoku(fight, fighterWhite, makeScoreEventId(7))).toEqual({
        reason: "scoring_limit_reached",
      });
      expect(recordHansoku(fight, fighterRed, makeScoreEventId(7))).toEqual({
        reason: "scoring_limit_reached",
      });
    });
  });
});
