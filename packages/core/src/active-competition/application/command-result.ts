export type CommandResult =
  | { ok: true }
  | {
      ok: false;
      reason: "fight_not_found" | "not_active" | "illegal_transition" | "scoring_not_allowed";
    };
