type BaseIpponCode = "M" | "K" | "D" | "T";
type SpecialIpponCode = "Ht" | "I";
type HansokuCode = "Δ";

export type IpponCode = BaseIpponCode | SpecialIpponCode;
export type AssignableIpponCode = BaseIpponCode | HansokuCode;

export type AssignableIpponList = Array<{ code: AssignableIpponCode; label: string }>;

export const IpponCode = {
  Men: "M",
  Kote: "K",
  Do: "D",
  Tsuki: "T",
  Hantei: "Ht",
  Ippon: "I",
} as const satisfies Record<string, IpponCode>;

export const AssignableIpponCode = {
  Men: "M",
  Kote: "K",
  Do: "D",
  Tsuki: "T",
  Hansoku: "Δ",
} as const satisfies Record<string, AssignableIpponCode>;

export const assignableCodes: AssignableIpponList = [
  { code: AssignableIpponCode.Men, label: "Men" },
  { code: AssignableIpponCode.Kote, label: "Kote" },
  { code: AssignableIpponCode.Do, label: "Do" },
  { code: AssignableIpponCode.Tsuki, label: "Tsuki" },
  { code: AssignableIpponCode.Hansoku, label: "Hansoku" },
];

/*
 * Ajout de variants de assignableCodes pour illustrer la séparation des Ippons et des Hansokus
 */

export const assignableIppons = [
  { code: AssignableIpponCode.Men, label: "Men" },
  { code: AssignableIpponCode.Kote, label: "Kote" },
  { code: AssignableIpponCode.Do, label: "Do" },
  { code: AssignableIpponCode.Tsuki, label: "Tsuki" },
] as const;

export const hansoku = {
  code: AssignableIpponCode.Hansoku,
  label: "Hansoku",
};
