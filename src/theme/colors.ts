export const colors = {
  /** Outer “wall” behind the framed board */
  background: '#3d2817',
  /** Main chalkboard green */
  board: '#2a4538',
  /** Darker green for depth / inset areas */
  boardDeep: '#1e342c',
  /** Panels and inputs sitting on the board */
  surface: '#355a49',
  surfaceStrong: '#3d6654',

  /** Wood frame around the board */
  frame: '#5c3d2e',
  frameHighlight: '#7a5540',

  /** Chalk-like text */
  text: '#f2efe6',
  textMuted: '#9eb8aa',

  /** Cream “chalk” filled buttons */
  buttonPrimary: '#f2ead9',
  buttonPrimaryPressed: '#ddd4c4',
  buttonPrimaryText: '#152520',

  /** Golden chalk accents (selections, sliders, links) */
  primary: '#ffe9a8',
  primaryPressed: '#ffd866',

  /** Hairline rules drawn in chalk */
  border: 'rgba(242, 239, 230, 0.22)',
  /** Stronger chalk rules for fraction visuals and answer tiles */
  borderStrong: 'rgba(242, 239, 230, 0.52)',

  /** Fraction models: shaded piece, empty piece, and dark outlines */
  fractionShaded: '#FF8A00',
  fractionUnshaded: '#FFFFFF',
  fractionLine: '#1A1A1A',

  success: '#c8f5d4',
  successSoft: 'rgba(90, 140, 110, 0.45)',
  error: '#ffc9c9',
  errorSoft: 'rgba(130, 70, 70, 0.42)',

  /** Practice feedback strip (white card on chalkboard) */
  feedbackBg: '#FFFFFF',
  feedbackCorrectText: '#0f6b38',
  feedbackIncorrectText: '#c62828',
  feedbackCorrectBorder: '#a8e6bd',
  feedbackIncorrectBorder: '#ffc9c9',

  /** Quiz review “traffic light” lamps on dark board */
  quizSignalGreen: '#4ade80',
  quizSignalRed: '#f87171',

  chip: 'rgba(255, 255, 255, 0.07)',
  chipSelected: 'rgba(255, 233, 168, 0.28)',
} as const;
