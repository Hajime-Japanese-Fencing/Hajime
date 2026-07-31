import { describe, expect, it } from "vite-plus/test";
import { getBracketRoundLabel } from "./bracket-round-label.ts";

describe("getBracketRoundLabel", () => {
  it("labels the last round as the final regardless of bracket size", () => {
    expect(getBracketRoundLabel(1, 1)).toBe("Final");
    expect(getBracketRoundLabel(4, 4)).toBe("Final");
  });

  it("labels the round before the final as the semi-finals", () => {
    expect(getBracketRoundLabel(3, 4)).toBe("Semi-finals");
  });

  it("labels two rounds before the final as the quarter-finals", () => {
    expect(getBracketRoundLabel(2, 4)).toBe("Quarter-finals");
  });

  it("labels earlier rounds by the number of fighters still in contention", () => {
    expect(getBracketRoundLabel(1, 4)).toBe("Round of 16");
    expect(getBracketRoundLabel(1, 5)).toBe("Round of 32");
  });
});
