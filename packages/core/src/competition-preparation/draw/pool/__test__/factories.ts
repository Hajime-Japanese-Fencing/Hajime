import type { FighterEntry } from "../../../../shared/fighter.ts";
import { makeFighterId } from "../../../../shared/fighter-id.ts";
import type { PoolFighter } from "../domain/distribution/pool-fighter.ts";
import type { Pool } from "../domain/pool.ts";

export function poolFighterEntryFactory(fighterEntry: Partial<FighterEntry>): FighterEntry {
  return {
    id: makeFighterId("1"),
    isSeeded: false,
    club: "Club A",
    ...fighterEntry,
  };
}

export function makePoolFighter(
  id: string,
  club: string = "club A",
  isSeeded: boolean = false,
): PoolFighter {
  return {
    fighter: {
      id: makeFighterId(id),
      isSeeded,
      club,
    },
  };
}

export class PoolBuilder {
  protected number: number = 1;
  protected size: number = 3;
  protected fighters: PoolFighter[] = [
    makePoolFighter("1"),
    makePoolFighter("2"),
    makePoolFighter("3"),
  ];

  public createPool(): PoolBuilder {
    return this;
  }

  public withSize(newSize: number): PoolBuilder {
    this.size = newSize;
    this.fighters = [];
    for (let i = 0; i < this.size; i++) {
      this.fighters.push(makePoolFighter((i + 1).toString()));
    }
    return this.createPool();
  }

  public toPool(): Pool {
    return {
      number: this.number,
      size: this.size,
      fighters: this.fighters,
    };
  }
}
