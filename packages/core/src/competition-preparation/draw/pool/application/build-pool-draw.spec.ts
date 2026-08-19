import { describe, it, expect } from "vite-plus/test";
import { buildPoolDraw } from "./build-pool-draw.ts";

describe("buildPoolDraw", () => {
  it("turns each pool into a PoolRecord and generates its pool fights", () => {
    let n = 0;
    const idGen = () => `f${++n}`; // ids déterministes

    const pool = {
      number: 1,
      size: 3,
      fighters: [
        { fighter: { id: "a", isSeeded: false, club: "X" } },
        { fighter: { id: "b", isSeeded: false, club: "Y" } },
        { fighter: { id: "c", isSeeded: false, club: "Z" } },
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
