import {
  FightStatus,
  makeFightId,
  makeFighterId,
  makePoolId,
  makeBracketRoundId,
  makeScoreEventId,
  type CompetitionId,
  type CompetitionDraw,
  type CompetitionDrawLoader,
} from "@hajime/core";

export class DemoLoadCompetitionFightsAdapter implements CompetitionDrawLoader {
  async load(_competitionId: CompetitionId): Promise<CompetitionDraw> {
    const poolId = makePoolId(1);

    const redFighter = makeFighterId("3");
    const whiteFighter = makeFighterId("9");
    const fighterTanaka = makeFighterId("tanaka");
    const fighterSuzuki = makeFighterId("suzuki");
    const fighterYamamoto = makeFighterId("yamamoto");
    const fighterSato = makeFighterId("sato");
    const fighterIto = makeFighterId("ito");
    const fighterKobayashi = makeFighterId("kobayashi");

    const fightId1 = makeFightId(1);
    const fightId2 = makeFightId(2);
    const fightId3 = makeFightId(3);

    // --- DEMO ELIMINATION BRACKET: A SEMI-FINAL ROUND (order 1) FEEDING A FINAL (order 2) ---
    const semiFinalRoundId = makeBracketRoundId(1);
    const finalRoundId = makeBracketRoundId(2);

    const fightId4 = makeFightId(4);
    const fightId5 = makeFightId(5);
    const fightId6 = makeFightId(6);

    return {
      pools: [
        {
          id: poolId,
          fighterIds: [
            fighterTanaka,
            fighterSuzuki,
            fighterYamamoto,
            fighterSato,
            fighterIto,
            fighterKobayashi,
          ],
          fightIds: [fightId1, fightId2, fightId3],
        },
      ],
      bracketRounds: [
        { id: semiFinalRoundId, order: 1, fightIds: [fightId4, fightId5] },
        { id: finalRoundId, order: 2, fightIds: [fightId6] },
      ],
      fights: [
        {
          id: fightId1,
          poolId,
          bracketRoundId: null,
          redFighterId: redFighter,
          whiteFighterId: whiteFighter,
          status: FightStatus.Waiting,
          scoreEvents: [],
        },
        {
          id: fightId2,
          poolId,
          bracketRoundId: null,
          redFighterId: makeFighterId("3-yamamoto"),
          whiteFighterId: makeFighterId("9-sato"),
          status: FightStatus.Finished,
          scoreEvents: [
            {
              id: makeScoreEventId(1),
              fighterId: makeFighterId("3-yamamoto"),
              type: "ippon",
              code: "M",
              firstBlood: true,
            },
            {
              id: makeScoreEventId(2),
              fighterId: makeFighterId("9-sato"),
              type: "hansoku",
              code: "Δ",
              firstBlood: false,
            },
            {
              id: makeScoreEventId(3),
              fighterId: makeFighterId("9-sato"),
              type: "ippon",
              code: "D",
              firstBlood: false,
            },
            {
              id: makeScoreEventId(4),
              fighterId: makeFighterId("3-yamamoto"),
              type: "ippon",
              code: "K",
              firstBlood: false,
            },
          ],
        },
        {
          id: fightId3,
          poolId,
          bracketRoundId: null,
          redFighterId: makeFighterId("ito"),
          whiteFighterId: makeFighterId("kobayashi"),
          status: FightStatus.Waiting,
          scoreEvents: [],
        },
        {
          id: fightId4,
          poolId: null,
          bracketRoundId: semiFinalRoundId,
          redFighterId: fighterTanaka,
          whiteFighterId: fighterSato,
          status: FightStatus.Waiting,
          scoreEvents: [],
        },
        {
          id: fightId5,
          poolId: null,
          bracketRoundId: semiFinalRoundId,
          redFighterId: fighterIto,
          whiteFighterId: fighterKobayashi,
          status: FightStatus.Waiting,
          scoreEvents: [],
        },
        {
          id: fightId6,
          poolId: null,
          bracketRoundId: finalRoundId,
          redFighterId: fighterTanaka,
          whiteFighterId: fighterIto,
          status: FightStatus.Waiting,
          scoreEvents: [],
        },
      ],
    };
  }
}
