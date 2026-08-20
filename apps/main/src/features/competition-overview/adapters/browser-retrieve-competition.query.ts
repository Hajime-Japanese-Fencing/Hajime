import {
  CompetitionDate,
  isCompetitionStatus,
  makeCompetitionId,
  type CompetitionOverview,
  type RetrieveCompetitionsQuery,
} from "@hajime/core";
import { db, type CompetitionRecord } from "../../../bootstrap/container/db.ts";

export class BrowserRetrieveCompetitionsQuery implements RetrieveCompetitionsQuery {
  async retrieveAll(): Promise<CompetitionOverview[]> {
    const records = await db.competitions.toArray();

    return records.map((record) => this.toCompetitionOverview(record));
  }

  private toCompetitionOverview(record: CompetitionRecord): CompetitionOverview {
    // status validation
    if (!isCompetitionStatus(record.status)) {
      throw new Error(
        `Competition "${record.id}" has an unknown status in storage: "${record.status}"`,
      );
    }

    return {
      id: makeCompetitionId(record.id),
      name: record.name,
      place: record.place,
      date: CompetitionDate.fromISO(record.date),
      status: record.status,
    };
  }
}
