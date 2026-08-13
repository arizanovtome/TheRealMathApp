export type RangePreset = { label: string; min: number; max: number };

/** High bound for addition & subtraction operands (low is always 1; smallest cap is 5). */
export const ADDITION_SUBTRACTION_MAX_OPTIONS = [5, 10, 20, 50, 100, 1000, 1_000_000] as const;

/** Addition result cap only (no 5); unlimited is a separate slider step in the UI. */
export const ADDITION_ANSWER_MAX_OPTIONS = [10, 20, 50, 100, 1000, 1_000_000] as const;
export type AdditionAnswerMaxNumeric = (typeof ADDITION_ANSWER_MAX_OPTIONS)[number];
export type AdditionAnswerMax = AdditionAnswerMaxNumeric | 'unlimited';

export const DIVISION_ANSWER_RANGE_PRESETS: RangePreset[] = [
  { label: '1–5', min: 1, max: 5 },
  { label: '1–10', min: 1, max: 10 },
  { label: '1–12', min: 1, max: 12 },
];

/** Numbers that appear before “to the nearest …” in rounding questions. */
export const ROUNDING_VALUE_RANGE_PRESETS: RangePreset[] = [
  { label: '1–99', min: 1, max: 99 },
  { label: '1–999', min: 1, max: 999 },
  { label: '10–99', min: 10, max: 99 },
  { label: '100–999', min: 100, max: 999 },
];
