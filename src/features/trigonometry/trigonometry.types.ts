export type TrigRatio = 'sin' | 'cos' | 'tan' | 'cot';

export type TrigSideRole = 'opposite' | 'adjacent' | 'hypotenuse';

export type TrigDiagramTarget = TrigSideRole | 'angle';

export type TrigonometryQuestionSubtype = 'pick_formula' | 'name_side';

/** θ is always at the bottom-left acute corner (same as Learn diagrams). */
export type TrigonometryThetaCorner = 'bottom_left';

export const TRIGONOMETRY_STANDARD_THETA_CORNER: TrigonometryThetaCorner = 'bottom_left';

export type TrigonometryDiagram = {
  thetaCorner: TrigonometryThetaCorner;
  /** What to find — a side or angle θ. */
  unknown?: TrigDiagramTarget;
  /** @deprecated Use `unknown` — kept for Learn rows without numbers. */
  unknownSide?: TrigSideRole;
  /** Side highlighted in name_side questions. */
  highlightedSide?: TrigSideRole;
  /** Numeric labels on known sides (shown on the diagram). */
  knownValues?: Partial<Record<TrigSideRole, number>>;
  /** Known acute angle at θ (find-side pick-formula questions). */
  knownAngleDegrees?: number;
};

export type TrigonometryConfig = {
  enabled: boolean;
  ratios: Record<TrigRatio, boolean>;
  questionKinds: {
    pickFormula: boolean;
    nameSide: boolean;
    /** Pick a formula when θ is the unknown. */
    findAngle: boolean;
  };
};

export const DEFAULT_TRIGONOMETRY_CONFIG: TrigonometryConfig = {
  enabled: false,
  ratios: {
    sin: true,
    cos: true,
    tan: false,
    cot: false,
  },
  questionKinds: {
    pickFormula: true,
    nameSide: true,
    findAngle: true,
  },
};
