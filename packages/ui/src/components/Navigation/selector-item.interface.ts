export interface SelectorItem {
  id: string;
  label: string;
  disabled?: boolean;
  /** Completion ratio (0 to 1) shown as a fill starting from the left, e.g. finished fights / total fights. */
  progress?: number;
}
