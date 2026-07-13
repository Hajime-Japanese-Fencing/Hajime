import type { CompetitionDate } from "./competition-date.ts";
import type { CompetitionId } from "./competition-id.ts";
import type { CompetitionStatus } from "./competition-status.ts";

export interface CompetitionOverview {
  readonly id: CompetitionId;
  readonly name: string;
  readonly place: string;
  readonly date: CompetitionDate;
  readonly status: CompetitionStatus;
}
