import type { FighterEntry } from "../../../../shared/fighter.ts";
import type { Bracket, BracketMatch, BracketRound } from "./bracket.ts";

export function generateBracket(
  fighters: FighterEntry[],
  shouldSeparateClubMembers: boolean = false,
  shouldGenerateThirdPlaceMatch: boolean = false,
): Bracket {
  // --- TESTING FOR INCORRECT INPUTS ---
  if (!Number.isInteger(fighters.length) || fighters.length < 2) {
    throw new Error("cannot create a bracket for less than 2 fighters");
  }

  // --- COMPUTING BRACKET SIZE ---
  const bracketSize = nextPowerOfTwo(fighters.length);
  const seedOrder = buildSeedOrder(bracketSize);

  // --- RANKING FIGHTERS (SERIES HEADS FIRST) AND PLACING THEM ON STANDARD SEED POSITIONS ---
  const rankedFighters = shouldSeparateClubMembers
    ? rankFightersSeparatedByClubs(fighters, seedOrder)
    : rankFighters(fighters);

  const slots: (FighterEntry | null)[] = seedOrder.map((rank) =>
    rank <= rankedFighters.length ? rankedFighters[rank - 1] : null,
  );

  // --- BUILDING FIRST ROUND ---
  const firstRoundMatches: BracketMatch[] = pairFighters(slots);

  const rounds: BracketRound[] = [{ order: 1, matches: firstRoundMatches }];

  // --- BUILDING SUBSEQUENT (EMPTY) ROUNDS UNTIL THE FINAL ---
  let nbMatchesInRound = firstRoundMatches.length / 2;
  let order = 2;

  while (nbMatchesInRound >= 1) {
    rounds.push({
      order,
      matches: Array.from({ length: nbMatchesInRound }, () => ({
        fighter1: null,
        fighter2: null,
      })),
    });

    nbMatchesInRound /= 2;
    order++;
  }

  // --- A THIRD-PLACE MATCH NEEDS TWO SEMI-FINAL LOSERS TO EXIST, I.E. AT LEAST A
  // SEMI-FINAL ROUND: WITH ONLY 2 FIGHTERS THE FINAL IS THE ONLY ROUND, SO THE OPTION
  // IS SILENTLY IGNORED RATHER THAN PRODUCING A MATCH THAT COULD NEVER BE FILLED. ---
  const thirdPlaceMatch: BracketMatch | null =
    shouldGenerateThirdPlaceMatch && rounds.length >= 2 ? { fighter1: null, fighter2: null } : null;

  let bracket: Bracket = { size: bracketSize, rounds, thirdPlaceMatch };

  for (let matchIndex = 0; matchIndex < firstRoundMatches.length; matchIndex++) {
    if (firstRoundMatches[matchIndex].fighter2 === null) {
      if (firstRoundMatches[matchIndex].fighter1 === null) {
        throw new Error("Should not happen, most likely an issue with pairFighters");
      }
      bracket = advanceWinner(bracket, 1, matchIndex, firstRoundMatches[matchIndex].fighter1!);
    }
  }

  return bracket;
}

export function advanceWinner(
  bracket: Bracket,
  roundOrder: number,
  matchIndex: number,
  winner: FighterEntry,
): Bracket {
  const currentRound = bracket.rounds.find((round) => round.order === roundOrder);
  if (!currentRound) {
    throw new Error("No such round");
  }

  const match = currentRound.matches[matchIndex];
  if (!match) {
    throw new Error("No such match");
  }

  if (winner.id !== match.fighter1?.id && winner.id !== match.fighter2?.id) {
    throw new Error("Winner must participate in the match");
  }

  // --- THE FINAL HAS NO NEXT ROUND TO PROPAGATE TO: NOTHING ELSE TO DO ---
  // TODO: handle what to do with the tournament champion eventually.
  if (roundOrder === bracket.rounds.length) {
    return bracket;
  }

  const nextRoundOrder = roundOrder + 1;
  const nextMatchIndex = Math.floor(matchIndex / 2);
  // --- EVEN matchIndex -> fighter1 OF THE NEXT MATCH, ODD -> fighter2 ---
  const nextMatchSlot = matchIndex % 2 === 0 ? "fighter1" : "fighter2";

  // --- REBUILD ONLY THE PATH THAT CHANGES (BRACKET -> ROUND -> MATCHES -> MATCH), EVERYTHING
  // ELSE IS REUSED AS-IS SO WE NEVER MUTATE THE BRACKET PASSED IN. ---
  const rounds = bracket.rounds.map((round) => {
    if (round.order !== nextRoundOrder) {
      return round;
    }

    const matches = round.matches.map((nextMatch, index) => {
      if (index !== nextMatchIndex) {
        return nextMatch;
      }

      return { ...nextMatch, [nextMatchSlot]: winner };
    });

    return { ...round, matches };
  });

  return { ...bracket, rounds };
}

// --- ASSIGNS A SEMI-FINAL LOSER TO THE THIRD-PLACE MATCH. semiFinalMatchIndex IS THE INDEX
// OF THE SEMI-FINAL MATCH THE LOSER CAME FROM (0 OR 1): THE SAME EVEN/ODD -> fighter1/fighter2
// SLOT RULE USED BY advanceWinner APPLIES HERE. ---
export function assignThirdPlaceParticipant(
  bracket: Bracket,
  semiFinalMatchIndex: number,
  loser: FighterEntry,
): Bracket {
  if (!bracket.thirdPlaceMatch) {
    throw new Error("This bracket has no third-place match");
  }

  const semiFinalRoundOrder = bracket.rounds.length - 1;
  const semiFinalRound = bracket.rounds.find((round) => round.order === semiFinalRoundOrder);
  if (!semiFinalRound) {
    throw new Error("No such round");
  }

  const semiFinalMatch = semiFinalRound.matches[semiFinalMatchIndex];
  if (!semiFinalMatch) {
    throw new Error("No such match");
  }

  if (loser.id !== semiFinalMatch.fighter1?.id && loser.id !== semiFinalMatch.fighter2?.id) {
    throw new Error("Loser must have fought in that semi-final match");
  }

  // --- EVEN semiFinalMatchIndex -> fighter1 OF THE THIRD-PLACE MATCH, ODD -> fighter2 ---
  const thirdPlaceSlot = semiFinalMatchIndex % 2 === 0 ? "fighter1" : "fighter2";

  return {
    ...bracket,
    thirdPlaceMatch: { ...bracket.thirdPlaceMatch, [thirdPlaceSlot]: loser },
  };
}

function nextPowerOfTwo(n: number): number {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

// --- RANKS FIGHTERS FROM 1 TO N, SERIES HEADS FIRST (SO THEY LAND ON THE STRONGEST SEED SLOTS) ---
function rankFighters(fighters: FighterEntry[]): FighterEntry[] {
  const seededFighters = fighters.filter((fighter) => fighter.isSeeded);
  const others = shuffle(fighters.filter((fighter) => !fighter.isSeeded));

  return [...seededFighters, ...others];
}

// --- SAME RANKING AS ABOVE, BUT TRIES TO AVOID PAIRING TWO FIGHTERS FROM THE SAME CLUB
// AGAINST EACH OTHER IN THE FIRST ROUND (BEST EFFORT: FALLS BACK TO A SAME-CLUB MATCH
// WHEN THERE IS NO OTHER OPTION LEFT). ---
function rankFightersSeparatedByClubs(
  fighters: FighterEntry[],
  seedOrder: number[],
): FighterEntry[] {
  const seededFighters = fighters.filter((fighter) => fighter.isSeeded);
  const others = shuffle(fighters.filter((fighter) => !fighter.isSeeded));

  const seededCount = seededFighters.length;
  const totalCount = fighters.length;

  // --- RANKS SEEDEDCOUNT+1..TOTALCOUNT ARE THE ONES "OTHERS" WILL OCCUPY ---
  const isOtherRank = (rank: number) => rank > seededCount && rank <= totalCount;

  // --- ONLY THE MATCHUPS WHERE BOTH SIDES ARE "OTHERS" NEED A CLUB CHECK: A MATCHUP
  // AGAINST A SERIES HEAD OR A BYE HAS ONLY ONE SIDE TO FILL, SO THERE IS NO CHOICE TO MAKE. ---
  const otherVsOtherMatchups = buildMatchupPairs(seedOrder).filter(
    ([rankA, rankB]) => isOtherRank(rankA) && isOtherRank(rankB),
  );

  const rankToFighter = new Map<number, FighterEntry>();
  const remainingFighters = [...others];

  for (const [rankA, rankB] of otherVsOtherMatchups) {
    const fighterForRankA = remainingFighters.shift()!;

    const differentClubIndex = remainingFighters.findIndex(
      (fighter) => fighter.club !== fighterForRankA.club,
    );
    // --- NO FIGHTER FROM ANOTHER CLUB LEFT: FALL BACK TO A SAME-CLUB MATCH ---
    const fighterForRankB =
      differentClubIndex === -1
        ? remainingFighters.shift()!
        : remainingFighters.splice(differentClubIndex, 1)[0];
    rankToFighter.set(rankA, fighterForRankA);
    rankToFighter.set(rankB, fighterForRankB);
  }

  // --- REMAINING "OTHER" RANKS ARE PAIRED WITH A SERIES HEAD OR A BYE: NO CONSTRAINT TO APPLY ---
  for (let rank = seededCount + 1; rank <= totalCount; rank++) {
    if (!rankToFighter.has(rank)) {
      rankToFighter.set(rank, remainingFighters.shift()!);
    }
  }

  const orderedOthers = Array.from({ length: others.length }, (_, index) =>
    rankToFighter.get(seededCount + 1 + index)!,
  );

  return [...seededFighters, ...orderedOthers];
}

// --- STANDARD BRACKET SEEDING ORDER ---
// Recursively builds the seed-number placed at each physical slot (1-indexed), so that:
// - the two strongest seeds are always in opposite halves of the bracket (and so on recursively),
// - byes (seed numbers greater than the number of real fighters) always land on the strongest
//   remaining seeds first, without ever pairing two byes against each other.
function buildSeedOrder(bracketSize: number): number[] {
  let order = [1];
  let size = 1;

  while (size < bracketSize) {
    size *= 2;
    order = order.flatMap((seed) => [seed, size + 1 - seed]);
  }

  return order;
}

// --- TURNS A SEED ORDER INTO THE LIST OF RANK-VS-RANK MATCHUPS IT PRODUCES IN THE FIRST ROUND ---
function buildMatchupPairs(order: number[]): [number, number][] {
  const pairs: [number, number][] = [];

  for (let i = 0; i < order.length; i += 2) {
    pairs.push([order[i], order[i + 1]]);
  }

  return pairs;
}

function pairFighters(slots: (FighterEntry | null)[]): BracketMatch[] {
  const matches: BracketMatch[] = [];

  for (let i = 0; i < slots.length; i += 2) {
    const first = slots[i];
    const second = slots[i + 1];

    // --- A BYE ALWAYS SITS AS fighter2, NEVER AS fighter1 ---
    matches.push(
      first === null ? { fighter1: second, fighter2: null } : { fighter1: first, fighter2: second },
    );
  }

  return matches;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
