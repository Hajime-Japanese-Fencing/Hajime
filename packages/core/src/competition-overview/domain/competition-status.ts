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

/**
 * Narrows an arbitrary string to CompetitionStatus. Meant for adapters reading this value back
 * from storage that can't type-check it (e.g. a Dexie/IndexedDB record, where it's persisted as
 * a plain string) — validate at the boundary rather than trusting a cast.
 */
export function isCompetitionStatus(value: string): value is CompetitionStatus {
  return (Object.values(CompetitionStatus) as string[]).includes(value);
}
