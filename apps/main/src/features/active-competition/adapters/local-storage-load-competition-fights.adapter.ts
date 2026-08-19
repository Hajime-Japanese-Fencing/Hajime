import type { CompetitionDraw, CompetitionDrawLoader, CompetitionId } from "@hajime/core";
import { competitionDrawStore } from "../../../persistence/competition-draw.store.ts";

// --- A COMPETITION THAT HAS NEVER HAD A DRAW PUBLISHED YET (E.G. FIRST VISIT, NOTHING
// GENERATED OR PERSISTED) LOADS AS EMPTY RATHER THAN THROWING — THE UI ALREADY HANDLES ZERO
// POOLS/FIGHTS FINE (useFightGroupSelector's phaseItems JUST COMES OUT EMPTY). ---
const EMPTY_DRAW: CompetitionDraw = { pools: [], fights: [] };

export class LocalStorageLoadCompetitionFightsAdapter implements CompetitionDrawLoader {
  async load(competitionId: CompetitionId): Promise<CompetitionDraw> {
    return competitionDrawStore.get(competitionId) ?? EMPTY_DRAW;
  }
}
