export type Side = "RED" | "WHITE";
export const Side = {
  Red: "RED",
  White: "WHITE",
} as const satisfies Record<string, Side>;

export const SideLabel = {
  RED: "Rouge",
  WHITE: "Blanc",
} as const satisfies Record<Side, string>;
