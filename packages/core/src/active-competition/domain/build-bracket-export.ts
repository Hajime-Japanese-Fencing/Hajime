import { FightStatus } from "../../shared/fight-status.ts";
import type { FighterId } from "../../shared/fighter-id.ts";
import { getBracketRoundLabel } from "../../competition-preparation/draw/bracket/domain/bracket-round-label.ts";
import { determineFightWinner } from "./fight/fight-winner.ts";
import type { FightRecord } from "./fight-record.ts";
import type { BracketRoundRecord } from "./bracket-round-record.ts";
import type { ActiveCompetitionView } from "../state/active-competition-view.ts";

const THIRD_PLACE_LABEL = "3rd place match";

/**
 * One match of an exported bracket round, aligned by position (`matchIndex`, implicit from its
 * place in `BracketExportRound.matches`) with the round's other matches — same convention as
 * `FightRecord.bracketMatchIndex` / `BracketPendingMatch.matchIndex`. Both fighters are `null`
 * for a match not yet playable (waiting on a previous round's result); `winner` is `null` until
 * the match is finished and its score breaks the tie (see `determineFightWinner`).
 */
export interface BracketExportMatch {
  readonly fighter1: FighterId | null;
  readonly fighter2: FighterId | null;
  readonly winner: FighterId | null;
}

export interface BracketExportRound {
  readonly label: string;
  readonly kind: "main" | "thirdPlace";
  readonly matches: BracketExportMatch[];
}

export interface BracketExport {
  readonly rounds: BracketExportRound[];
}

/**
 * Builds a printable snapshot of the current elimination bracket from the active competition's
 * view: one row of matches per round, in bracket order, each carrying the two fighters and the
 * winner determined so far. Meant to be handed to a rendering layer (e.g. the PDF export) that
 * only needs fighter identities and outcomes, not the full live-fight machinery
 * (scoreEvents, status transitions...).
 *
 * Rounds are ordered by `BracketRoundRecord.order`, which already places the third-place match
 * between the semi-finals and the final. Round labels reuse `getBracketRoundLabel`, counted only
 * over "main" rounds so the third-place match doesn't shift the numbering (mirrors
 * `useFightGroupSelector` on the app side).
 */
export function buildBracketExport(view: ActiveCompetitionView): BracketExport {
  const totalMainRounds = view.bracketRounds.filter(
    (round) => (round.kind ?? "main") === "main",
  ).length;

  const rounds = [...view.bracketRounds]
    .sort((a, b) => a.order - b.order)
    .map(
      (round): BracketExportRound => ({
        label:
          round.kind === "thirdPlace"
            ? THIRD_PLACE_LABEL
            : getBracketRoundLabel(round.order, totalMainRounds),
        kind: round.kind ?? "main",
        matches: buildRoundMatches(round, view.bracketRoundFights(round.id)),
      }),
    );

  return { rounds };
}

function buildRoundMatches(
  round: BracketRoundRecord,
  fights: readonly FightRecord[],
): BracketExportMatch[] {
  const totalMatches = round.fightIds.length + round.pendingMatches.length;
  const matches: BracketExportMatch[] = Array.from({ length: totalMatches }, () => ({
    fighter1: null,
    fighter2: null,
    winner: null,
  }));

  for (const fight of fights) {
    if (fight.bracketMatchIndex === null) continue;

    matches[fight.bracketMatchIndex] = {
      fighter1: fight.redFighterId,
      fighter2: fight.whiteFighterId,
      winner: fight.status === FightStatus.Finished ? determineFightWinner(fight) : null,
    };
  }

  for (const pending of round.pendingMatches) {
    matches[pending.matchIndex] = {
      fighter1: pending.fighter1,
      fighter2: pending.fighter2,
      winner: null,
    };
  }

  return matches;
}
