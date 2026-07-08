
import type {ASSIGNABLE_CODE} from "@hajime/core/src/index.ts";

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

export interface IpponAssignEvent {
    leftFighter?: boolean;
    code: ASSIGNABLE_CODE;
}



export type NewResultEvent = Omit<IpponResultEvent, "id" | "firstBlood">;
export type IpponResultData = Pick<IpponResultEvent, "id" | "code" | "firstBlood">;

// UI
export interface IpponResultEvent {
    id: number;
    leftFighter: boolean;
    type: "ippon" | "hansoku";
    code: "K" | "M" | "D" | "T" | "Ht" | "Δ";
    firstBlood: boolean;
}

export interface Side {
    label: "Red" | "White";
    bgClass: string;
    textClass: string;
}

// Metier
export type FightStatus = "Waiting" | "In progress" | "Finished";
export type Action = "validate" | "cancel" | "forfeit";
