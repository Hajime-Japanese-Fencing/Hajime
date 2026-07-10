import { CompetitionStatus, type CompetitionStatus as CompetitionStatusType } from "@hajime/core";

export function colorFromStatus(status: CompetitionStatusType) {
  switch (status) {
    case CompetitionStatus.InProgress:
      return "warning";
    case CompetitionStatus.PreCompetition:
      return "info";
    case CompetitionStatus.Finished:
      return "success";
    case CompetitionStatus.Creation:
    default:
      return "secondary";
  }
}
