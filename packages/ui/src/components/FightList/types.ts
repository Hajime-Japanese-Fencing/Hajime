import type { AssignableIpponCode, Side, FightStatus, ScoreEvent } from "@hajime/core";
import { BadgeColor } from "../DataDisplay/types.ts";
import type { FighterId, FightId } from "@hajime/core";

// Metier
interface SideFighter {
  fighterId: FighterId; // Obsolète si utilisation de slots
  fighterName: string;
}

export interface Fight {
  id: FightId;
  fighter1: SideFighter;
  fighter2: SideFighter;
  score: string | null;
  status: FightStatus;
  scoreEvents: ScoreEvent[];
  editable: boolean;
}

// CE QU ON GARDE EN DESSOUS

export type Action = "validate" | "cancel" | "forfeit";

export interface FightSide {
  side: Side;
  label: string;
  class: string;
}

export type AssignIpponEvent = {
  side: Side;
  code: AssignableIpponCode;
};

export const StatusColor = {
  waiting: BadgeColor.warning,
  in_progress: BadgeColor.info,
  finished: BadgeColor.success,
} as const satisfies Record<FightStatus, BadgeColor>;
