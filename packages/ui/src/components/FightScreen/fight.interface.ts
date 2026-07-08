import type { AssignableIpponCode, Side } from "@hajime/core";

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

/**
 * @todo Migrer dans @hajime/core
 */
// Metier
export type FightStatus = "Waiting" | "In progress" | "Finished";

// CE QU ON GARDE EN DESSOUS

export type Action = "validate" | "cancel" | "forfeit";

export interface FightSide {
  side: Side;
  label: string;
  bgClass: string;
  textClass: string;
}

export type AssignIpponEvent = {
  side: Side;
  code: AssignableIpponCode;
};
