export type BadgeColor =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "error";

export const BadgeColor = {
  primary: "primary",
  secondary: "secondary",
  accent: "accent",
  neutral: "neutral",
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
} as const satisfies Record<BadgeColor, string>;
