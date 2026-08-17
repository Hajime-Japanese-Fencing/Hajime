import type { FighterId } from "../../../shared/fighter-id.ts";
import type { FightRecord } from "../../../shared/fight-record.ts";

// --- COUNTS IPPON-TYPE SCORE EVENTS PER FIGHTER; WHOEVER HAS MORE WINS. RETURNS null WHEN
// TIED (INCLUDING 0-0): NEITHER A HANTEI NOR A FORFEIT DECISION IS MODELLED AS A SCORE EVENT
// YET, SO A TIE HERE MEANS "NO DECISION RECORDED", NOT "DRAW" — THE FIGHT SHOULDN'T ADVANCE
// A BRACKET UNTIL A REFEREE DECISION BREAKS IT. ---
export function determineFightWinner(fight: FightRecord): FighterId | null {
  // --- A BYE (NO whiteFighterId) HAS NO REAL OPPONENT: redFighterId WINS AUTOMATICALLY,
  // WITHOUT NEEDING ANY SCORE EVENT TO DECIDE IT. ---
  if (fight.whiteFighterId === null) return fight.redFighterId;

  const redIppons = countIppons(fight, fight.redFighterId);
  const whiteIppons = countIppons(fight, fight.whiteFighterId);

  if (redIppons === whiteIppons) return null;
  return redIppons > whiteIppons ? fight.redFighterId : fight.whiteFighterId;
}

function countIppons(fight: FightRecord, fighterId: FighterId): number {
  return fight.scoreEvents.filter(
    (event) => event.type === "ippon" && event.fighterId === fighterId,
  ).length;
}
