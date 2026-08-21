import type { Bracket, BracketMatch } from "../domain/bracket.ts";
import { makeFightId } from "../../../../shared/fight-id.ts";
import {
  makeBracketRoundId,
  makeThirdPlaceBracketRoundId,
} from "../../../../shared/bracket-round-id.ts";
import { makeFighterId } from "../../../../shared/fighter-id.ts";
import { FightStatus } from "../../../../shared/fight-status.ts";
import type { IdGenerator } from "../../../../shared/id-generator.ts";
import type { FightId } from "../../../../shared/fight-id.ts";
import type {
  BracketPendingMatch,
  BracketRoundRecord,
} from "../../../../shared/bracket-round-record.ts";
import type { FightRecord } from "../../../../shared/fight-record.ts";
import type { CompetitionId } from "../../../../shared/competition-id.ts";

export interface BracketDraw {
  readonly bracketRounds: BracketRoundRecord[];
  readonly fights: FightRecord[];
}

/**
 * Converts a freshly generated `Bracket` (rounds of `BracketMatch`, carrying full `FighterEntry`
 * objects) into the runtime shape the rest of the app consumes: `BracketRoundRecord[]` +
 * `FightRecord[]`, as used by `CompetitionDraw` / `ActiveCompetitionState`.
 *
 * Each fight gets a fresh UUID (`crypto.randomUUID()`), so there's no id-collision risk to manage
 * across combined draws (e.g. a pool phase draw published alongside this bracket) — unlike the
 * old incrementing-counter scheme, no `startingFightId` is needed here.
 */
export function buildBracketDraw(
  bracket: Bracket,
  idGenerator: IdGenerator,
  competitionId: CompetitionId,
): BracketDraw {
  const roundIds = bracket.rounds.map((_, index) => makeBracketRoundId(competitionId, index + 1));
  const thirdPlaceRoundId = bracket.thirdPlaceMatch
    ? makeThirdPlaceBracketRoundId(competitionId)
    : null;

  const fights: FightRecord[] = [];

  const bracketRounds: BracketRoundRecord[] = bracket.rounds.map((round, roundIndex) => {
    const fightIds: FightId[] = [];
    const pendingMatches: BracketPendingMatch[] = [];

    round.matches.forEach((match, matchIndex) => {
      if (match.fighter1 !== null && match.fighter2 !== null) {
        const fightId = makeFightId(idGenerator());

        fights.push({
          id: fightId,
          poolId: null,
          bracketRoundId: roundIds[roundIndex],
          bracketMatchIndex: matchIndex,
          redFighterId: makeFighterId(match.fighter1.id),
          whiteFighterId: makeFighterId(match.fighter2.id),
          status: FightStatus.Waiting,
          scoreEvents: [],
        });
        fightIds.push(fightId);
        return;
      }

      // --- A FIRST-ROUND MATCH WITH ONLY fighter1 SET IS A BYE THAT generateBracket ALREADY
      // RESOLVED: IT PROPAGATED fighter1 INTO THE NEXT ROUND VIA advanceWinner BEFORE EVEN
      // RETURNING THE BRACKET. IT'S SURFACED AS A REAL, ALREADY-Finished FightRecord (RATHER
      // THAN SILENTLY DROPPED) SO IT'S VISIBLE IN THE QUARTER/ROUND LIST LIKE ANY OTHER MATCH —
      // whiteFighterId IS null SINCE THERE'S NO REAL OPPONENT, AND fighter1 IS THE AUTOMATIC
      // WINNER (SEE determineFightWinner). THIS CAN ONLY HAPPEN AT ROUND INDEX 0 — LATER
      // ROUNDS WITH ONLY fighter1 KNOWN ARE GENUINELY PENDING (WAITING ON AN ADJACENT MATCH'S
      // WINNER), SO THEY FALL THROUGH TO THE pendingMatches CASE BELOW INSTEAD. ---
      if (roundIndex === 0 && match.fighter1 !== null && match.fighter2 === null) {
        const fightId = makeFightId(idGenerator());

        fights.push({
          id: fightId,
          poolId: null,
          bracketRoundId: roundIds[roundIndex],
          bracketMatchIndex: matchIndex,
          redFighterId: makeFighterId(match.fighter1.id),
          whiteFighterId: null,
          status: FightStatus.Finished,
          scoreEvents: [],
        });
        fightIds.push(fightId);
        return;
      }

      pendingMatches.push(toPendingMatch(match, matchIndex));
    });

    const isLastRound = roundIndex === bracket.rounds.length - 1;
    const isSemiFinalRound = roundIndex === bracket.rounds.length - 2;

    return {
      id: roundIds[roundIndex],
      order: round.order,
      feedsRoundId: isLastRound ? null : roundIds[roundIndex + 1],
      // --- undefined WHENEVER THERE'S NO THIRD-PLACE ROUND TO FEED, EVEN ON THE SEMI-FINAL
      // ROUND ITSELF — NOT null. thirdPlaceRoundId IS null IN THAT CASE, BUT LEAKING THAT
      // THROUGH HERE WOULD MAKE THIS FIELD null ON THE SEMI-FINAL AND undefined EVERYWHERE
      // ELSE FOR THE SAME "NO ROUTING" MEANING — BracketRoundRecord's OWN DOC COMMENT TREATS
      // BOTH AS EQUIVALENT, BUT CONSUMERS SHOULDN'T HAVE TO CARE WHICH ONE THIS PRODUCES. ---
      loserFeedsRoundId: isSemiFinalRound && thirdPlaceRoundId ? thirdPlaceRoundId : undefined,
      dependsOnRoundId: roundIndex === 0 ? null : roundIds[roundIndex - 1],
      fightIds,
      pendingMatches,
    };
  });

  if (thirdPlaceRoundId) {
    const semiFinalRound = bracket.rounds[bracket.rounds.length - 2];
    const semiFinalRoundId = roundIds[roundIds.length - 2];

    bracketRounds.push({
      id: thirdPlaceRoundId,
      order: semiFinalRound.order + 0.5,
      kind: "thirdPlace",
      feedsRoundId: null,
      dependsOnRoundId: semiFinalRoundId,
      fightIds: [],
      pendingMatches: [{ matchIndex: 0, fighter1: null, fighter2: null }],
    });
  }

  return { bracketRounds, fights };
}

function toPendingMatch(match: BracketMatch, matchIndex: number): BracketPendingMatch {
  return {
    matchIndex,
    fighter1: match.fighter1 ? makeFighterId(match.fighter1.id) : null,
    fighter2: match.fighter2 ? makeFighterId(match.fighter2.id) : null,
  };
}
