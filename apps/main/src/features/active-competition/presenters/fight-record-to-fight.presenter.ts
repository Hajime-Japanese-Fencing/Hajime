import {
  FightStatus,
  makeFighterId,
  makeFightId,
  type FightRecord,
  type BracketPendingMatch,
  type BracketRoundId,
} from "@hajime/core";
import type { Fight } from "@hajime/ui";

export function presentFight(record: FightRecord, canOpen = true): Fight {
  const ipponsRed = record.scoreEvents.filter(
    (event) => event.type === "ippon" && event.fighterId === record.redFighterId,
  );
  const ipponsWhite = record.scoreEvents.filter(
    (event) => event.type === "ippon" && event.fighterId === record.whiteFighterId,
  );

  return {
    id: record.id,
    fighter1: {
      fighterId: record.redFighterId,
      fighterName: String(record.redFighterId),
    },
    fighter2: {
      fighterId: record.whiteFighterId,
      fighterName: String(record.whiteFighterId),
    },
    status: record.status,
    score:
      ipponsRed.length === 0 && ipponsWhite.length === 0
        ? null
        : `${ipponsRed.length} - ${ipponsWhite.length}`,
    scoreEvents: record.scoreEvents,
    editable: record.status !== FightStatus.Finished,
    canOpen,
  };
}

const MISSING_FIGHTER_LABEL = "-";

/**
 * Presents a bracket match that isn't playable yet (one or both fighters still unknown,
 * waiting on a previous round's result) — shown with "-" placeholders instead of names, and
 * no action available since there's no fight to open yet.
 */
export function presentPendingMatch(
  bracketRoundId: BracketRoundId,
  match: BracketPendingMatch,
): Fight {
  return {
    id: makePendingFightId(bracketRoundId, match.matchIndex),
    fighter1: {
      fighterId: match.fighter1 ?? makeFighterId(""),
      fighterName: match.fighter1 ? String(match.fighter1) : MISSING_FIGHTER_LABEL,
    },
    fighter2: {
      fighterId: match.fighter2 ?? makeFighterId(""),
      fighterName: match.fighter2 ? String(match.fighter2) : MISSING_FIGHTER_LABEL,
    },
    status: FightStatus.Waiting,
    score: null,
    scoreEvents: [],
    editable: false,
    isPlaceholder: true,
    canOpen: false,
  };
}

// --- SYNTHETIC, NEGATIVE FightId FOR A PENDING MATCH THAT HAS NO REAL FightRecord YET.
// NEGATIVE SO IT CAN NEVER COLLIDE WITH A REAL (POSITIVE, SEQUENTIALLY-MINTED) FightId, AND
// DETERMINISTIC FROM (bracketRoundId, matchIndex) SO THE ROW KEEPS A STABLE :key ACROSS
// RE-RENDERS UNTIL IT GETS PROMOTED INTO A REAL FIGHT. ---
function makePendingFightId(bracketRoundId: BracketRoundId, matchIndex: number) {
  return makeFightId(-(Number(bracketRoundId) * 1000 + matchIndex + 1));
}
