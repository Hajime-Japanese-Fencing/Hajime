import {
  CompetitionDate,
  CompetitionStatus,
  makeCompetitionId,
  type RetrieveCompetitionsQuery,
} from "@hajime/core";

export class DemoRetrieveCompetitionsQuery implements RetrieveCompetitionsQuery {
  async retrieveAll() {
    return [
      {
        id: makeCompetitionId("single-inprogress-comp"),
        name: "Compétion Simple en cours",
        place: "Dojo de Paris",
        date: CompetitionDate.fromISO("2026-09-15"),
        status: CompetitionStatus.InProgress,
      },
      {
        id: makeCompetitionId("single-pre-comp"),
        name: "Compétition Simple en phase pré-compétition",
        place: "Salle du Bourget",
        date: CompetitionDate.fromISO("2026-10-03"),
        status: CompetitionStatus.PreCompetition,
      },
      {
        id: makeCompetitionId("single-finished-comp"),
        name: "Compétition Simple terminée",
        place: "Centre sportif de Lyon",
        date: CompetitionDate.fromISO("2026-11-21"),
        status: CompetitionStatus.Finished,
      },
    ];
  }
}
