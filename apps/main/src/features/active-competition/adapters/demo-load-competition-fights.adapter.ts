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

// --- THE BRACKET PHASE DEMO STARTS DIRECTLY AT THE QUARTER-FINALS (8 FIGHTERS). TWO OF THE
// FOUR QUARTER-FINALS ARE ALREADY FINISHED, WHICH LETS ONE SEMI-FINAL BE PROMOTED INTO A REAL,
// PLAYABLE FIGHT (BOTH ITS FIGHTERS ARE NOW KNOWN) WHILE THE OTHER SEMI-FINAL AND THE FINAL
// STAY AS PENDING MATCHES — THIS IS EXACTLY THE STATE advanceBracket PRODUCES AS RESULTS COME
// IN, SO THE DEMO DOUBLES AS A FIXTURE FOR IT RATHER THAN SOMETHING HAND-WAVED. ---
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
            bracketMatchIndex: null,
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

    const [hayashi, shimizu, yamashita, mori, abe, ikeda, hashimoto, ishikawa] =
      BRACKET_FIGHTER_NAMES.map((name) => makeFighterId(name));

    const quarterFinalId = makeBracketRoundId(1);
    const semiFinalId = makeBracketRoundId(2);
    const finalId = makeBracketRoundId(3);

    // --- QUARTER-FINALS: MATCH 0 AND 1 ALREADY PLAYED (SO THEIR WINNERS CAN FEED SEMI-FINAL
    // MATCH 0), MATCHES 2 AND 3 STILL WAITING. ---
    const quarterFinalMatchups: [string, string, boolean][] = [
      [hayashi, shimizu, true],
      [yamashita, mori, true],
      [abe, ikeda, false],
      [hashimoto, ishikawa, false],
    ];

    const quarterFinalFightIds: FightId[] = quarterFinalMatchups.map(
      ([redFighterId, whiteFighterId, finished], matchIndex) => {
        const fightId = makeFightId(nextFightId++);

        fights.push({
          id: fightId,
          poolId: null,
          bracketRoundId: quarterFinalId,
          bracketMatchIndex: matchIndex,
          redFighterId: makeFighterId(redFighterId),
          whiteFighterId: makeFighterId(whiteFighterId),
          status: finished ? FightStatus.Finished : FightStatus.Waiting,
          scoreEvents: finished
            ? [
                {
                  id: makeScoreEventId(nextFightId * 10 + 1),
                  fighterId: makeFighterId(redFighterId),
                  type: "ippon",
                  code: "M",
                  firstBlood: true,
                },
                {
                  id: makeScoreEventId(nextFightId * 10 + 2),
                  fighterId: makeFighterId(redFighterId),
                  type: "ippon",
                  code: "K",
                  firstBlood: false,
                },
              ]
            : [],
        });

        return fightId;
      },
    );

    // --- SEMI-FINAL MATCH 0 IS ALREADY PROMOTED (hayashi vs yamashita, THE TWO FINISHED
    // QUARTER-FINALS' WINNERS) — MATCH 1 IS STILL PENDING ON MATCHES 2 AND 3. ---
    const semiFinalFightId = makeFightId(nextFightId++);
    fights.push({
      id: semiFinalFightId,
      poolId: null,
      bracketRoundId: semiFinalId,
      bracketMatchIndex: 0,
      redFighterId: hayashi,
      whiteFighterId: yamashita,
      status: FightStatus.Waiting,
      scoreEvents: [],
    });

    return {
      pools,
      bracketRounds: [
        { id: quarterFinalId, order: 1, fightIds: quarterFinalFightIds, pendingMatches: [] },
        {
          id: semiFinalId,
          order: 2,
          fightIds: [semiFinalFightId],
          pendingMatches: [{ matchIndex: 1, fighter1: null, fighter2: null }],
        },
        {
          id: finalId,
          order: 3,
          fightIds: [],
          pendingMatches: [{ matchIndex: 0, fighter1: null, fighter2: null }],
        },
      ],
      fights,
    };
  }
}
