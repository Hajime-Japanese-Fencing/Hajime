export type CompetitionStatus = "creation" | "pre_competition" | "in_progress" | "finished";

export const CompetitionStatus = {
  Creation: "creation",
  PreCompetition: "pre_competition",
  InProgress: "in_progress",
  Finished: "finished",
} as const satisfies Record<string, CompetitionStatus>;

export const CompetitionStatusLabel = {
  creation: "Creation",
  pre_competition: "Pre-competition",
  in_progress: "In progress",
  finished: "Finished",
} as const satisfies Record<CompetitionStatus, string>;
