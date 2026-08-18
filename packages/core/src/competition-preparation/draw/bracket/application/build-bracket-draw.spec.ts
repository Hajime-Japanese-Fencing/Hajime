import { describe, expect, it } from "vite-plus/test";
import { generateBracket } from "../domain/generate-bracket.service.ts";
import { makeFighterId } from "../../../../shared/fighter-id.ts";
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
    // Assert that first round fights are playable, while next round fights are pending
    const bracket = generateBracket(makeSeededFighters(["w", "x", "y", "z"]));

    const draw = buildBracketDraw(bracket);

    expect(draw.fights).toMatchObject([
      {
        poolId: null,
        bracketRoundId: draw.bracketRounds[0].id,
        bracketMatchIndex: 0,
        redFighterId: makeFighterId("w"),
        whiteFighterId: makeFighterId("z"),
        status: FightStatus.Waiting,
        scoreEvents: [],
      },
      {
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
      // --- READ BACK FROM draw.fights RATHER THAN HARDCODED — SAME REASON AS ABOVE. THIS STILL
      // VERIFIES firstRound ACTUALLY POINTS AT THE TWO REAL FIGHTS JUST CREATED, IN ORDER. ---
      fightIds: draw.fights.map((fight) => fight.id),
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

  it("turns a resolved first-round bye into an already-Finished fight the seeded fighter automatically wins", () => {
    // --- 3 SEEDED FIGHTERS -> BRACKET SIZE 4 -> ONE BYE IN THE FIRST ROUND. "a" (RANK 1)
    // GETS THE BYE AND generateBracket ALREADY PROPAGATES IT INTO THE FINAL. ---
    const bracket = generateBracket(makeSeededFighters(["a", "b", "c"]));

    const draw = buildBracketDraw(bracket);

    // --- BOTH THE BYE AND THE REAL b VS c MATCH BECOME FightRecords — NOTHING IS DROPPED. ---
    expect(draw.fights).toHaveLength(2);

    const [byeFight, realFight] = draw.fights;
    expect(byeFight).toMatchObject({
      poolId: null,
      bracketRoundId: draw.bracketRounds[0].id,
      bracketMatchIndex: 0,
      redFighterId: makeFighterId("a"),
      whiteFighterId: null,
      status: FightStatus.Finished,
      scoreEvents: [],
    });
    expect(realFight).toMatchObject({
      bracketMatchIndex: 1,
      redFighterId: makeFighterId("b"),
      whiteFighterId: makeFighterId("c"),
      status: FightStatus.Waiting,
    });

    const [firstRound, finalRound] = draw.bracketRounds;
    expect(firstRound.fightIds).toEqual([byeFight.id, realFight.id]);
    expect(firstRound.pendingMatches).toEqual([]);

    // --- a'S BYE ADVANCEMENT MUST STILL SURVIVE AS A PENDING MATCH ON THE FINAL, NOT BE LOST. ---
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
});
