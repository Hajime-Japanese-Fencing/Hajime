type BASE_IPPON_CODE = "M" | "K" | "D" | "T";
type SPECIAL_IPPON_CODE = "Ht" | "I";
type HANSOKU_CODE = "Δ";

export type IPPON_CODE = BASE_IPPON_CODE | SPECIAL_IPPON_CODE;
export type ASSIGNABLE_CODE = BASE_IPPON_CODE | HANSOKU_CODE;

export type AssignableCodeList = Array<{ code: ASSIGNABLE_CODE; label: string }>;

export const assignableCodes: AssignableCodeList = [
  { code: "M", label: "Men" },
  { code: "K", label: "Kote" },
  { code: "D", label: "Do" },
  { code: "T", label: "Tsuki" },
  { code: "Δ", label: "Hansoku" },
];
