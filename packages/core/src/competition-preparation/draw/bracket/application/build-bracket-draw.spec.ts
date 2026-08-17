import { describe, expect, it } from "vite-plus/test";
import { generateBracket } from "../domain/generate-bracket.service.ts";
import { makeFighterId } from "../../../../shared/fighter-id.ts";
import { makeFightId } from "../../../../shared/fight-id.ts";
import { FightStatus } from "../../../../shared/fight-status.ts";
import type { FighterEntry } from "../../../../shared/fighter.ts";
import { buildBracketDraw } from "./build-bracket-draw.ts";

// --- ALL FIGHTERS ARE SEEDED SO rankFighters/rankFightersSeparatedByClubs NEVER SHUFFLES
// THEM (SHUFFLE ONLY APPLIES TO NON-SEEDED FIGHTERS) — KEEPS THE RESULTING BRACKET LAYOUT
// DETERMINISTIC FOR THESE TESTS. ---
function makeSeededFighters(ids: string[]): FighterEntry[] {
  return ids.map((id) => ({ id, isSeeded: true, club: "club A" }));
}

describe("buildBracketDraw", () => {
  it("turns a bracket with no bye and no third-place match into rounds and playable first-round fights", () => {
    const bracket = generateBracket(makeSeededFighters(["w", "x", "y", "z"]));

    const draw = buildBracketDraw(bracket);

    expect(draw.fights).toEqual([
      {
        id: makeFightId(1),
        poolId: null,
        bracketRoundId: draw.bracketRounds[0].id,
        bracketMatchIndex: 0,
        redFighterId: makeFighterId("w"),
        whiteFighterId: makeFighterId("z"),
        status: FightStatus.Waiting,
        scoreEvents: [],
      },
      {
        id: makeFightId(2),
        poolId: null,
        bracketRoundId: draw.bracketRounds[0].id,
        bracketMatchIndex: 1,
        redFighterId: makeFighterId("x"),
        whiteFighterId: makeFighterId("y"),
        status: FightStatus.Waiting,
        scoreEvents: [],
      },
    ]);

    expect(draw.bracketRounds).toHaveLength(2);
    const [firstRound, finalRound] = draw.bracketRounds;

    expect(firstRound).toEqual({
      id: firstRound.id,
      order: 1,
      feedsRoundId: finalRound.id,
      loserFeedsRoundId: undefined,
      dependsOnRoundId: null,
      fightIds: [makeFightId(1), makeFightId(2)],
      pendingMatches: [],
    });

    expect(finalRound).toEqual({
      id: finalRound.id,
      order: 2,
      feedsRoundId: null,
      loserFeedsRoundId: undefined,
      dependsOnRoundId: firstRound.id,
      fightIds: [],
      pendingMatches: [{ matchIndex: 0, fighter1: null, fighter2: null }],
    });
  });

  it("drops a resolved first-round bye instead of turning it into a fight or a pending match", () => {
    // --- 3 SEEDED FIGHTERS -> BRACKET SIZE 4 -> ONE BYE IN THE FIRST ROUND. "a" (RANK 1)
    // GETS THE BYE AND generateBracket ALREADY PROPAGATES IT INTO THE FINAL. ---
    const bracket = generateBracket(makeSeededFighters(["a", "b", "c"]));

    const draw = buildBracketDraw(bracket);

    // --- ONLY b VS c IS A REAL FIRST-ROUND FIGHT — a'S BYE MATCH ISN'T TURNED INTO ANYTHING. ---
    expect(draw.fights).toHaveLength(1);
    expect(draw.fights[0]).toMatchObject({
      redFighterId: makeFighterId("b"),
      whiteFighterId: makeFighterId("c"),
    });

    const [firstRound, finalRound] = draw.bracketRounds;
    expect(firstRound.fightIds).toEqual([draw.fights[0].id]);
    expect(firstRound.pendingMatches).toEqual([]);

    // --- a'S BYE ADVANCEMENT MUST SURVIVE AS A PENDING MATCH ON THE FINAL, NOT BE LOST. ---
    expect(finalRound.pendingMatches).toEqual([
      { matchIndex: 0, fighter1: makeFighterId("a"), fighter2: null },
    ]);
    expect(finalRound.fightIds).toEqual([]);
  });

  it("wires the third-place round and the semi-finals' loserFeedsRoundId when requested", () => {
    const bracket = generateBracket(
      makeSeededFighters(["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"]),
      false,
      true,
    );

    const draw = buildBracketDraw(bracket);

    expect(draw.fights).toHaveLength(4);
    expect(draw.bracketRounds).toHaveLength(4);

    const [firstRound, semiFinalRound, finalRound, thirdPlaceRound] = draw.bracketRounds;

    expect(semiFinalRound).toMatchObject({
      order: 2,
      feedsRoundId: finalRound.id,
      loserFeedsRoundId: thirdPlaceRound.id,
      dependsOnRoundId: firstRound.id,
      pendingMatches: [
        { matchIndex: 0, fighter1: null, fighter2: null },
        { matchIndex: 1, fighter1: null, fighter2: null },
      ],
    });

    expect(thirdPlaceRound).toEqual({
      id: thirdPlaceRound.id,
      order: 2.5,
      kind: "thirdPlace",
      feedsRoundId: null,
      dependsOnRoundId: semiFinalRound.id,
      fightIds: [],
      pendingMatches: [{ matchIndex: 0, fighter1: null, fighter2: null }],
    });

    expect(finalRound.loserFeedsRoundId).toBeUndefined();
  });

  it("does not create a third-place round when it wasn't requested", () => {
    const bracket = generateBracket(makeSeededFighters(["f1", "f2", "f3", "f4"]), false, false);

    const draw = buildBracketDraw(bracket);

    expect(draw.bracketRounds.every((round) => round.kind !== "thirdPlace")).toBe(true);
    expect(draw.bracketRounds.every((round) => round.loserFeedsRoundId === undefined)).toBe(true);
  });

  it("mints fight ids starting from the given startingFightId", () => {
    const bracket = generateBracket(makeSeededFighters(["w", "x", "y", "z"]));

    const draw = buildBracketDraw(bracket, 50);

    expect(draw.fights.map((fight) => fight.id)).toEqual([makeFightId(50), makeFightId(51)]);
  });
});
