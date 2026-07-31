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
  type FightId,
  type FightRecord,
  type PoolRecord,
} from "@hajime/core";

// --- 4 POOLS OF 4 FIGHTERS EACH (ROUND-ROBIN, 6 FIGHTS PER POOL) ---
const POOL_FIGHTER_NAMES = [
  ["tanaka", "suzuki", "yamamoto", "sato"],
  ["ito", "kobayashi", "watanabe", "nakamura"],
  ["kato", "yoshida", "yamada", "sasaki"],
  ["yamaguchi", "matsumoto", "inoue", "kimura"],
];

// --- THE BRACKET PHASE DEMO STARTS DIRECTLY AT THE QUARTER-FINALS (8 FIGHTERS), SO THE
// DEMO DRAW ONLY NEEDS QUARTER + SEMI + FINAL ROUNDS (4 + 2 + 1 FIGHTS) RATHER THAN THE
// FULL BRACKET GENERATED FROM THE POOL RESULTS. ---
const BRACKET_FIGHTER_NAMES = [
  "hayashi",
  "shimizu",
  "yamashita",
  "mori",
  "abe",
  "ikeda",
  "hashimoto",
  "ishikawa",
];

export class DemoLoadCompetitionFightsAdapter implements CompetitionDrawLoader {
  async load(_competitionId: CompetitionId): Promise<CompetitionDraw> {
    let nextFightId = 1;
    const fights: FightRecord[] = [];

    const pools: PoolRecord[] = POOL_FIGHTER_NAMES.map((names, poolIndex) => {
      const poolId = makePoolId(poolIndex + 1);
      const fighterIds = names.map((name) => makeFighterId(name));
      const fightIds: FightId[] = [];

      // --- ROUND-ROBIN: EVERY FIGHTER MEETS EVERY OTHER FIGHTER OF THE POOL ONCE ---
      for (let i = 0; i < fighterIds.length; i++) {
        for (let j = i + 1; j < fighterIds.length; j++) {
          const fightId = makeFightId(nextFightId++);
          fightIds.push(fightId);

          // --- ONLY POOL 1's FIGHTS ARE FINISHED, TO PREVIEW A PARTIALLY-FILLED PROGRESS
          // BAR ON THE OTHER POOLS AND A FULLY-FILLED ONE HERE. ---
          const finished = poolIndex === 0;

          fights.push({
            id: fightId,
            poolId,
            bracketRoundId: null,
            redFighterId: fighterIds[i],
            whiteFighterId: fighterIds[j],
            status: finished ? FightStatus.Finished : FightStatus.Waiting,
            scoreEvents: finished
              ? [
                  {
                    id: makeScoreEventId(nextFightId * 10 + 1),
                    fighterId: fighterIds[i],
                    type: "ippon",
                    code: "M",
                    firstBlood: true,
                  },
                  {
                    id: makeScoreEventId(nextFightId * 10 + 2),
                    fighterId: fighterIds[i],
                    type: "ippon",
                    code: "K",
                    firstBlood: false,
                  },
                ]
              : [],
          });
        }
      }

      return { id: poolId, fighterIds, fightIds };
    });

    const bracketFighterIds = BRACKET_FIGHTER_NAMES.map((name) => makeFighterId(name));

    const quarterFinalId = makeBracketRoundId(1);
    const semiFinalId = makeBracketRoundId(2);
    const finalId = makeBracketRoundId(3);

    const quarterFinalFightIds: FightId[] = [];
    for (let i = 0; i < 4; i++) {
      const fightId = makeFightId(nextFightId++);
      quarterFinalFightIds.push(fightId);

      fights.push({
        id: fightId,
        poolId: null,
        bracketRoundId: quarterFinalId,
        redFighterId: bracketFighterIds[i * 2],
        whiteFighterId: bracketFighterIds[i * 2 + 1],
        // --- HALF OF THE QUARTER-FINALS ALREADY PLAYED, TO PREVIEW A PARTIALLY-FILLED
        // PROGRESS BAR ON THE BRACKET PHASE TOO. ---
        status: i < 2 ? FightStatus.Finished : FightStatus.Waiting,
        scoreEvents: [],
      });
    }

    const semiFinalFightIds = [makeFightId(nextFightId++), makeFightId(nextFightId++)];
    semiFinalFightIds.forEach((fightId, index) => {
      fights.push({
        id: fightId,
        poolId: null,
        bracketRoundId: semiFinalId,
        redFighterId: bracketFighterIds[index * 4],
        whiteFighterId: bracketFighterIds[index * 4 + 2],
        status: FightStatus.Waiting,
        scoreEvents: [],
      });
    });

    const finalFightId = makeFightId(nextFightId++);
    fights.push({
      id: finalFightId,
      poolId: null,
      bracketRoundId: finalId,
      redFighterId: bracketFighterIds[0],
      whiteFighterId: bracketFighterIds[4],
      status: FightStatus.Waiting,
      scoreEvents: [],
    });

    return {
      pools,
      bracketRounds: [
        { id: quarterFinalId, order: 1, fightIds: quarterFinalFightIds },
        { id: semiFinalId, order: 2, fightIds: semiFinalFightIds },
        { id: finalId, order: 3, fightIds: [finalFightId] },
      ],
      fights,
    };
  }
}
