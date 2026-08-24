import type { FighterEntry } from "../../../../../shared/fighter.ts";
import { type FighterId, makeFighterId } from "../../../../../shared/fighter-id.ts";

export interface PoolFighter {
  fighter: FighterEntry;
}

export function toPoolFighter(fighter: FighterEntry): PoolFighter {
  return {
    fighter: fighter,
  };
}

export class buildPoolFighter implements PoolFighter {
  fighter: FighterEntry = {
    club: "Unknown Club",
    id: makeFighterId("1"),
    isSeeded: false,
    name: "Unnamed Fighter",
  };

  build(): PoolFighter {
    return {
      fighter: {
        club: this.fighter.club,
        id: this.fighter.id,
        isSeeded: this.fighter.isSeeded,
        name: this.fighter.name,
      },
    };
  }

  withId(id: FighterId): buildPoolFighter {
    this.fighter.id = id;
    return this;
  }
}
