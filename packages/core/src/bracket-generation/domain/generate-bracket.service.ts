import type { FighterEntry } from "../../fighter.ts";
import type { BracketMatch } from "./bracket-match.interface.ts";
import type { BracketRound } from "./bracket-round.interface.ts";
import type { Bracket } from "./bracket.interface.ts";

export function generateBracket(fighters: FighterEntry[]): Bracket {
  // --- TESTING FOR INCORRECT INPUTS ---
  if (!Number.isInteger(fighters.length) || fighters.length < 2) {
    throw new Error("cannot create a bracket for less than 2 fighters");
  }

  // --- COMPUTING BRACKET SIZE AND BYES ---
  const bracketSize = nextPowerOfTwo(fighters.length);
  const nbByes = bracketSize - fighters.length;

  const { byeFighters, remainingFighters } = selectByeFighters(fighters, nbByes);
  const shuffledFighters = shuffle(remainingFighters);

  // --- BUILDING FIRST ROUND ---
  const firstRoundMatches: BracketMatch[] = [
    ...byeFighters.map((fighter) => ({ fighter1: fighter, fighter2: null })),
    ...pairFighters(shuffledFighters),
  ];

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

  return { size: bracketSize, rounds };
}

function nextPowerOfTwo(n: number): number {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

function selectByeFighters(
  fighters: FighterEntry[],
  nbByes: number,
): { byeFighters: FighterEntry[]; remainingFighters: FighterEntry[] } {
  if (nbByes === 0) {
    return { byeFighters: [], remainingFighters: [...fighters] };
  }

  // --- SERIES HEADS ARE PRIORITIZED FOR BYES ---
  const seriesHeads = fighters.filter((fighter) => fighter.isSeriesHead);
  const others = fighters.filter((fighter) => !fighter.isSeriesHead);

  const byeFighters = seriesHeads.slice(0, nbByes);
  let remainingPool = [...seriesHeads.slice(nbByes), ...others];

  // --- NOT ENOUGH SERIES HEADS: COMPLETE BYES RANDOMLY ---
  if (byeFighters.length < nbByes) {
    const nbMissingByes = nbByes - byeFighters.length;
    const shuffledPool = shuffle(remainingPool);

    byeFighters.push(...shuffledPool.slice(0, nbMissingByes));
    remainingPool = shuffledPool.slice(nbMissingByes);
  }

  return { byeFighters, remainingFighters: remainingPool };
}

function pairFighters(fighters: FighterEntry[]): BracketMatch[] {
  const matches: BracketMatch[] = [];

  for (let i = 0; i < fighters.length; i += 2) {
    matches.push({ fighter1: fighters[i], fighter2: fighters[i + 1] });
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
