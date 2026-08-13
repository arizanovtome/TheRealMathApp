import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { getEnabledTrigonometrySubtypes } from '@/features/trigonometry/trigonometryConfig.utils';
import {
  buildNameSideDistractors,
  buildPickFormulaNumericDistractors,
  buildPickFormulaQuestionText,
  buildTrigMcOptions,
  formatNumericRatioLabel,
  randomAngleDegrees,
  randomKnownSideValues,
  ratioForDiagramTarget,
  ratioForKnownSidePair,
  sideLabel,
} from '@/features/trigonometry/trigonometryFormulas';
import type {
  TrigDiagramTarget,
  TrigRatio,
  TrigSideRole,
  TrigonometryDiagram,
  TrigonometryQuestionSubtype,
} from '@/features/trigonometry/trigonometry.types';
import { TRIGONOMETRY_STANDARD_THETA_CORNER } from '@/features/trigonometry/trigonometry.types';
import type { TrigonometryMathQuestion } from '@/features/questions/question.types';
import { i18n } from '@/i18n';
import { pickRandom } from '@/utils/random';

let questionIdCounter = 0;

function nextQuestionId(): string {
  questionIdCounter += 1;
  return `trig-${Date.now()}-${questionIdCounter}-${Math.random().toString(16).slice(2)}`;
}

const SIDE_ROLES: TrigSideRole[] = ['opposite', 'adjacent', 'hypotenuse'];

type PickFormulaScenario = {
  unknown: TrigDiagramTarget;
  knownSides: TrigSideRole[];
  knownValues: Partial<Record<TrigSideRole, number>>;
};

function valuesForKnownSides(knownSides: TrigSideRole[]): Partial<Record<TrigSideRole, number>> {
  return randomKnownSideValues(knownSides);
}

function buildFindSideScenarios(
  ratios: MathLearningConfig['trigonometry']['ratios'],
): PickFormulaScenario[] {
  const scenarios: PickFormulaScenario[] = [];
  for (const unknown of SIDE_ROLES) {
    if (unknown === 'opposite') {
      if (ratios.tan) {
        scenarios.push({
          unknown,
          knownSides: ['adjacent'],
          knownValues: valuesForKnownSides(['adjacent']),
        });
      }
      scenarios.push({
        unknown,
        knownSides: ['hypotenuse'],
        knownValues: valuesForKnownSides(['hypotenuse']),
      });
    } else if (unknown === 'adjacent') {
      if (ratios.cot) {
        scenarios.push({
          unknown,
          knownSides: ['opposite'],
          knownValues: valuesForKnownSides(['opposite']),
        });
      }
      scenarios.push({
        unknown,
        knownSides: ['hypotenuse'],
        knownValues: valuesForKnownSides(['hypotenuse']),
      });
    } else {
      scenarios.push({
        unknown,
        knownSides: ['opposite'],
        knownValues: valuesForKnownSides(['opposite']),
      });
      scenarios.push({
        unknown,
        knownSides: ['adjacent'],
        knownValues: valuesForKnownSides(['adjacent']),
      });
    }
  }
  return scenarios;
}

function buildFindAngleScenarios(
  ratios: MathLearningConfig['trigonometry']['ratios'],
): PickFormulaScenario[] {
  const scenarios: PickFormulaScenario[] = [];
  if (ratios.sin) {
    scenarios.push({
      unknown: 'angle',
      knownSides: ['opposite', 'hypotenuse'],
      knownValues: valuesForKnownSides(['opposite', 'hypotenuse']),
    });
  }
  if (ratios.cos) {
    scenarios.push({
      unknown: 'angle',
      knownSides: ['adjacent', 'hypotenuse'],
      knownValues: valuesForKnownSides(['adjacent', 'hypotenuse']),
    });
  }
  if (ratios.tan || ratios.cot) {
    scenarios.push({
      unknown: 'angle',
      knownSides: ['opposite', 'adjacent'],
      knownValues: valuesForKnownSides(['opposite', 'adjacent']),
    });
  }
  return scenarios;
}

function pickEnabledRatio(
  config: MathLearningConfig,
  preferred: TrigRatio,
  scenario: PickFormulaScenario,
): TrigRatio {
  const { ratios } = config.trigonometry;
  if (ratios[preferred]) return preferred;

  const legRatios = { tanEnabled: ratios.tan, cotEnabled: ratios.cot };
  if (scenario.unknown === 'angle') {
    const pairRatio = ratioForKnownSidePair(scenario.knownSides);
    if (pairRatio && ratios[pairRatio]) return pairRatio;
  }

  const fallback = ratioForDiagramTarget(
    scenario.unknown === 'angle' ? 'opposite' : scenario.unknown,
    scenario.knownSides.includes('hypotenuse')
      ? (['hypotenuse'] as TrigSideRole[])
      : scenario.knownSides,
    legRatios,
  );
  if (ratios[fallback]) return fallback;
  if (ratios.sin) return 'sin';
  if (ratios.cos) return 'cos';
  if (ratios.tan) return 'tan';
  return 'cot';
}

function generatePickFormula(
  config: MathLearningConfig,
  allowFindAngle: boolean,
): Omit<TrigonometryMathQuestion, 'id'> {
  const sideScenarios = buildFindSideScenarios(config.trigonometry.ratios);
  const angleScenarios = allowFindAngle
    ? buildFindAngleScenarios(config.trigonometry.ratios)
    : [];
  const scenario = pickRandom([...sideScenarios, ...angleScenarios]);

  let ratio = ratioForDiagramTarget(scenario.unknown, scenario.knownSides, {
    tanEnabled: config.trigonometry.ratios.tan,
    cotEnabled: config.trigonometry.ratios.cot,
  });

  if (
    scenario.unknown === 'angle' &&
    scenario.knownSides.includes('opposite') &&
    scenario.knownSides.includes('adjacent')
  ) {
    ratio = config.trigonometry.ratios.tan
      ? 'tan'
      : config.trigonometry.ratios.cot
        ? 'cot'
        : ratio;
  }

  ratio = pickEnabledRatio(config, ratio, scenario);
  const knownAngleDegrees =
    scenario.unknown !== 'angle' ? randomAngleDegrees() : undefined;
  const correctAnswer = formatNumericRatioLabel(
    ratio,
    scenario.knownValues,
    scenario.unknown,
    false,
    knownAngleDegrees,
  );
  return buildPickFormulaQuestion(config, scenario, correctAnswer, ratio, knownAngleDegrees);
}

function buildPickFormulaQuestion(
  config: MathLearningConfig,
  scenario: PickFormulaScenario,
  correctAnswer: string,
  correctRatio: TrigRatio,
  knownAngleDegrees?: number,
): Omit<TrigonometryMathQuestion, 'id'> {
  const diagram: TrigonometryDiagram = {
    thetaCorner: TRIGONOMETRY_STANDARD_THETA_CORNER,
    unknown: scenario.unknown,
    knownValues: scenario.knownValues,
    knownAngleDegrees,
  };
  return {
    kind: 'trigonometry',
    operation: 'trigonometry',
    subtype: 'pick_formula',
    questionText: buildPickFormulaQuestionText(scenario.unknown),
    correctAnswer,
    answerOptions: buildTrigMcOptions(
      correctAnswer,
      buildPickFormulaNumericDistractors(
        correctRatio,
        scenario.knownValues,
        scenario.unknown,
        knownAngleDegrees,
      ),
      config.answerOptionsCount,
    ),
    requiresMultipleChoice: true,
    diagram,
  };
}

function generateNameSide(
  config: MathLearningConfig,
): Omit<TrigonometryMathQuestion, 'id'> {
  const highlightedSide = pickRandom(SIDE_ROLES);
  const diagram: TrigonometryDiagram = {
    thetaCorner: TRIGONOMETRY_STANDARD_THETA_CORNER,
    highlightedSide,
  };
  const correctAnswer = sideLabel(highlightedSide);
  return {
    kind: 'trigonometry',
    operation: 'trigonometry',
    subtype: 'name_side',
    questionText: i18n.t('questions:trigRelativeSide'),
    correctAnswer,
    answerOptions: buildTrigMcOptions(
      correctAnswer,
      buildNameSideDistractors(highlightedSide),
      config.answerOptionsCount,
    ),
    requiresMultipleChoice: true,
    diagram,
  };
}

function generateForSubtype(
  config: MathLearningConfig,
  subtype: TrigonometryQuestionSubtype,
): Omit<TrigonometryMathQuestion, 'id'> {
  switch (subtype) {
    case 'pick_formula':
      return generatePickFormula(config, config.trigonometry.questionKinds.findAngle);
    case 'name_side':
      return generateNameSide(config);
  }
}

export function tryGenerateTrigonometryQuestion(
  config: MathLearningConfig,
): TrigonometryMathQuestion | null {
  const subtypes = getEnabledTrigonometrySubtypes(config.trigonometry);
  const pickFormulaAllowed =
    subtypes.includes('pick_formula') &&
    (config.trigonometry.ratios.sin ||
      config.trigonometry.ratios.cos ||
      config.trigonometry.ratios.tan ||
      config.trigonometry.ratios.cot);
  const nameSideAllowed = subtypes.includes('name_side');
  const pool = subtypes.filter((s) => {
    if (s === 'pick_formula') return pickFormulaAllowed;
    if (s === 'name_side') return nameSideAllowed;
    return false;
  });
  if (pool.length === 0) return null;
  const subtype = pickRandom(pool);
  const draft = generateForSubtype(config, subtype);
  return { ...draft, id: nextQuestionId() };
}
