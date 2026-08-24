import type { CompetitionOverview, SaveCompetitionPort } from "@hajime/core";
import { db } from "../../../bootstrap/container/db.ts";

export class BrowserSaveCompetitionQuery implements SaveCompetitionPort {
  async save(competition: CompetitionOverview): Promise<void> {
    await db.competitions.put({
      id: competition.id,
      name: competition.name,
      place: competition.place,
      date: competition.date.toISOString(),
      status: competition.status,
    });
  }
}
