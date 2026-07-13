import { newPoolFighter, type PoolFighter } from "./distribution/pool-fighter.interface.ts";

export interface Pool {
  number: number;
  size: number;
  fighters: PoolFighter[];
}

export class PoolBuilder {
  protected number: number = 1;
  protected size: number = 3;
  protected fighters: PoolFighter[] = [
    newPoolFighter("1"),
    newPoolFighter("2"),
    newPoolFighter("3"),
  ];

  public createPool(): PoolBuilder {
    return this;
  }

  public withSize(newSize: number): PoolBuilder {
    this.size = newSize;
    this.fighters = [];
    for (let i = 0; i < this.size; i++) {
      this.fighters.push(newPoolFighter((i + 1).toString()));
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
