export type ButtonColor =
  | "neutral"
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";

export type ButtonVariant = "outline" | "dash" | "soft" | "ghost" | "link";

export type ButtonProps = {
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  block?: boolean;
  wide?: boolean;
  disabled?: boolean;
  loading?: boolean;
};
