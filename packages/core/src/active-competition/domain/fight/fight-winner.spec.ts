import { describe, expect, it } from "vite-plus/test";
import { makeFightRecord, fighterRed, fighterWhite } from "../../__test__/fixtures.ts";
import { makeScoreEventId } from "../../../shared/score-event-id.ts";
import { determineFightWinner } from "./fight-winner.ts";

describe("determineFightWinner", () => {
  it("declares the fighter with more ippons the winner", () => {
    const fight = makeFightRecord({
      scoreEvents: [
        {
          id: makeScoreEventId(1),
          fighterId: fighterRed,
          type: "ippon",
          code: "M",
          firstBlood: true,
        },
        {
          id: makeScoreEventId(2),
          fighterId: fighterRed,
          type: "ippon",
          code: "K",
          firstBlood: false,
        },
        {
          id: makeScoreEventId(3),
          fighterId: fighterWhite,
          type: "ippon",
          code: "D",
          firstBlood: false,
        },
      ],
    });

    expect(determineFightWinner(fight)).toBe(fighterRed);
  });

  it("returns null when tied, including 0-0", () => {
    expect(determineFightWinner(makeFightRecord({ scoreEvents: [] }))).toBeNull();

    const tiedFight = makeFightRecord({
      scoreEvents: [
        {
          id: makeScoreEventId(1),
          fighterId: fighterRed,
          type: "ippon",
          code: "M",
          firstBlood: true,
        },
        {
          id: makeScoreEventId(2),
          fighterId: fighterWhite,
          type: "ippon",
          code: "D",
          firstBlood: false,
        },
      ],
    });
    expect(determineFightWinner(tiedFight)).toBeNull();
  });

  it("ignores hansoku events when counting ippons", () => {
    const fight = makeFightRecord({
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

    expect(determineFightWinner(fight)).toBeNull();
  });
});
