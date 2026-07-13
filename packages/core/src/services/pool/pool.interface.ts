import {type PoolFighter, toPoolFighter} from "./distribution/pool-fighter.interface.ts";

export interface Pool {
  number: number;
  size: number;
  fighters: PoolFighter[];
}

export class PoolBuilder {
    protected number: number = 1
    protected size: number = 3
    protected fighters: PoolFighter[] = [
        toPoolFighter({id: "1", club: "club A", isSeriesHead: false}),
        toPoolFighter({id: "2", club: "club A", isSeriesHead: false}),
        toPoolFighter({id: "3", club: "club A", isSeriesHead: false})
    ]

    public createPool(): PoolBuilder {
        return this
    }

    public withSize(newSize: number): PoolBuilder {
        this.size = newSize
        this.fighters = []
        for (let i = 0; i < this.size; i++) {
            this.fighters.push(toPoolFighter({id: (i+1).toString(), club: "club A", isSeriesHead: false}))
        }
        return this.createPool()
    }

    public toPool(): Pool {
        return {
            number: this.number,
            size: this.size,
            fighters: this.fighters
        }
    }
}