export type FightStatus = "waiting" | "in_progress" | "finished";

export const FightStatus = {
    Waiting: "waiting",
    InProgress: "in_progress",
    Finished: "finished",
} as const satisfies Record<string, FightStatus>;

export const FightStatusLabel = {
    waiting: "Waiting",
    in_progress: "In progress",
    finished: "Finished",
} as const satisfies Record<FightStatus, string>;