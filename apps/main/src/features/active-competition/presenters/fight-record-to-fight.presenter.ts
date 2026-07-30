import { FightStatus, type FightRecord } from "@hajime/core";
import type { Fight } from "@hajime/ui";

export function presentFight(record: FightRecord): Fight {
  const ipponsRed = record.scoreEvents.filter(
    (event) => event.type === "ippon" && event.fighterId === record.redFighterId,
  );
  const ipponsWhite = record.scoreEvents.filter(
    (event) => event.type === "ippon" && event.fighterId === record.whiteFighterId,
  );

  return {
    id: record.id,
    fighter1: {
      fighterId: record.redFighterId,
      fighterName: String(record.redFighterId),
    },
    fighter2: {
      fighterId: record.whiteFighterId,
      fighterName: String(record.whiteFighterId),
    },
    status: record.status,
    score:
      ipponsRed.length === 0 && ipponsWhite.length === 0
        ? null
        : `${ipponsRed.length} - ${ipponsWhite.length}`,
    scoreEvents: record.scoreEvents,
    editable: record.status !== FightStatus.Finished,
  };
}
