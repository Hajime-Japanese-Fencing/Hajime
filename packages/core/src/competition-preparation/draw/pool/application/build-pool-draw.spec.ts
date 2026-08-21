import { describe, it, expect } from "vite-plus/test";
import { buildPoolDraw } from "./build-pool-draw.ts";
import { makeFighterId } from "../../../../shared/fighter-id.ts";

describe("buildPoolDraw", () => {
  it("turns each pool into a PoolRecord and generates its pool fights", () => {
    let n = 0;
    const idGen = () => `f${++n}`; // ids déterministes

    const pool = {
      number: 1,
      size: 3,
      fighters: [
        { fighter: { id: makeFighterId("a"), name: "Fighter1", isSeeded: false, club: "X" } },
        { fighter: { id: makeFighterId("b"), name: "Fighter2", isSeeded: false, club: "Y" } },
        { fighter: { id: makeFighterId("c"), name: "Fighter3", isSeeded: false, club: "Z" } },
      ],
    };

    const draw = buildPoolDraw([pool], idGen);

    // une poule de 3 → 3 combats (round-robin)
    expect(draw.fights).toHaveLength(3);
    expect(draw.pools[0].id).toBe(1);
    expect(draw.pools[0].fighterIds).toEqual(["a", "b", "c"]);
    expect(draw.pools[0].fightIds).toHaveLength(3);
    expect(draw.fights.every((f) => f.poolId == 1 && f.status == "waiting")).toBe(true);
  });
});
