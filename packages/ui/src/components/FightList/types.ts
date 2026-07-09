import type { AssignableIpponCode, Side, FightStatus } from "@hajime/core";
import {BadgeColor} from "../DataDisplay/types.ts";

// Metier
export interface Fight {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: FightStatus;
  scoreEvents: IpponResultEvent[];
  editable: boolean;
}

export type IpponResultData = Pick<IpponResultEvent, "id" | "code" | "firstBlood">;

// UI
export interface IpponResultEvent {
  id: number;
  leftSide: boolean;
  type: "ippon" | "hansoku";
  code: "K" | "M" | "D" | "T" | "Ht" | "Δ";
  firstBlood: boolean;
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



