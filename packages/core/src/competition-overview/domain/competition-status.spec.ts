import { describe, it, expect } from "vite-plus/test";
import { CompetitionStatus, isCompetitionStatus } from "./competition-status.ts";

describe("Validating a competition status", () => {
  it("accepts every known CompetitionStatus value", () => {
    for (const status of Object.values(CompetitionStatus)) {
      expect(isCompetitionStatus(status)).toBe(true);
    }
  });

  it("rejects a string that isn't a known status", () => {
    expect(isCompetitionStatus("archived")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isCompetitionStatus("")).toBe(false);
  });
});
