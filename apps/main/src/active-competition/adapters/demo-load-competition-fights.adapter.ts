import {
  FightStatus,
  makeFightId,
  makeFighterId,
  makePoolId,
  type CompetitionId,
  type CompetitionFightsData,
  type LoadCompetitionFightsPort,
} from "@hajime/core";

export class DemoLoadCompetitionFightsAdapter implements LoadCompetitionFightsPort {
  async load(_competitionId: CompetitionId): Promise<CompetitionFightsData> {
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
      fights: [
        {
          id: fightId1,
          poolId,
          redFighterId: redFighter,
          whiteFighterId: whiteFighter,
          status: FightStatus.Waiting,
          scoreEvents: [],
        },
        {
          id: fightId2,
          poolId,
          redFighterId: makeFighterId("3-yamamoto"),
          whiteFighterId: makeFighterId("9-sato"),
          status: FightStatus.Finished,
          scoreEvents: [
            {
              id: 1 as any,
              fighterId: makeFighterId("3-yamamoto"),
              type: "ippon",
              code: "M",
              firstBlood: true,
            },
            {
              id: 2 as any,
              fighterId: makeFighterId("9-sato"),
              type: "hansoku",
              code: "Δ",
              firstBlood: false,
            },
            {
              id: 3 as any,
              fighterId: makeFighterId("9-sato"),
              type: "ippon",
              code: "D",
              firstBlood: false,
            },
            {
              id: 4 as any,
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
          redFighterId: makeFighterId("ito"),
          whiteFighterId: makeFighterId("kobayashi"),
          status: FightStatus.Waiting,
          scoreEvents: [],
        },
      ],
    };
  }
}
