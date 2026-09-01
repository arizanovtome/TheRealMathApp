import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import { CompactSwitch } from '@/components/learning-plan/CompactSwitch';
import type { NumberSenseConfig, PatternsConfig } from '@/features/learning-plan/learningPlan.types';
import {
  BASIC_SHAPES,
  type BasicShape,
  type ShapeRecognitionConfig,
} from '@/features/shapes/shapeRecognition.types';
import { basicShapeLabel } from '@/features/shapes/shapeRecognitionLabels';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { capitalizeFirst } from '@/utils/textCase';

type ShapeRecognitionSettingsCardProps = {
  shapeRecognition: ShapeRecognitionConfig;
  onChange: (shapeRecognition: ShapeRecognitionConfig) => void;
  patterns: PatternsConfig;
  onPatternsChange: (patterns: PatternsConfig) => void;
  numberSense: NumberSenseConfig;
  onNumberSenseChange: (numberSense: NumberSenseConfig) => void;
};

export function ShapeRecognitionSettingsCard({
  shapeRecognition,
  onChange,
  patterns,
  onPatternsChange,
  numberSense,
  onNumberSenseChange,
}: ShapeRecognitionSettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const disabled = !shapeRecognition.enabled;

  const toggleShape = (shape: BasicShape) => {
    onChange({
      ...shapeRecognition,
      shapes: {
        ...shapeRecognition.shapes,
        [shape]: !shapeRecognition.shapes[shape],
      },
    });
  };

  return (
    <OperationConfigCard
      operation="shape_recognition"
      enabled={shapeRecognition.enabled}
      onToggle={(enabled) => onChange({ ...shapeRecognition, enabled })}
    >
      <AppText variant="body" muted>
        {t('settings:shapeRecognitionDesc')}
      </AppText>
      <View style={styles.questionTypes}>
        <AppText variant="label" muted>{t('settings:questionTypes')}</AppText>
        <View style={styles.switchRow}>
          <AppText variant="label" style={styles.switchLabel}>{t('settings:identifyShape')}</AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:identifyShape')}
            value={shapeRecognition.shapeQuestions}
            onValueChange={(shapeQuestions) => onChange({ ...shapeRecognition, shapeQuestions })}
            disabled={disabled}
          />
        </View>
        <View style={styles.switchRow}>
          <AppText variant="label" style={styles.switchLabel}>{t('settings:identifyColor')}</AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:identifyColor')}
            value={shapeRecognition.colorQuestions}
            onValueChange={(colorQuestions) => onChange({ ...shapeRecognition, colorQuestions })}
            disabled={disabled}
          />
        </View>
        <View style={styles.switchRow}>
          <AppText variant="label" style={styles.switchLabel}>{t('settings:identifyColorAndShape')}</AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:identifyColorAndShape')}
            value={shapeRecognition.colorAndShapeQuestions}
            onValueChange={(colorAndShapeQuestions) =>
              onChange({ ...shapeRecognition, colorAndShapeQuestions })
            }
            disabled={disabled}
          />
        </View>
        <View style={styles.switchRow}>
          <AppText variant="label" style={styles.switchLabel}>{t('settings:countObjects')}</AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:countObjects')}
            value={numberSense.countObjects}
            onValueChange={(countObjects) => onNumberSenseChange({ ...numberSense, countObjects })}
            disabled={disabled}
          />
        </View>
        <View style={styles.switchRow}>
          <AppText variant="label" style={styles.switchLabel}>{t('settings:compareQuantities')}</AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:compareQuantities')}
            value={numberSense.compareQuantities}
            onValueChange={(compareQuantities) => onNumberSenseChange({ ...numberSense, compareQuantities })}
            disabled={disabled}
          />
        </View>
        <View style={styles.switchRow}>
          <AppText variant="label" style={styles.switchLabel}>{t('settings:shapePattern')}</AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:shapePattern')}
            value={patterns.shapePattern}
            onValueChange={(shapePattern) => onPatternsChange({ ...patterns, shapePattern })}
            disabled={disabled}
          />
        </View>
        <View style={styles.switchRow}>
          <AppText variant="label" style={styles.switchLabel}>{t('settings:coloredShapePattern')}</AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:coloredShapePattern')}
            value={patterns.coloredShapePattern}
            onValueChange={(coloredShapePattern) =>
              onPatternsChange({ ...patterns, coloredShapePattern })
            }
            disabled={disabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="label" muted>
          {t('settings:shapesToInclude')}
        </AppText>
        <View style={styles.chipRow}>
          {BASIC_SHAPES.map((shape) => {
            const selected = shapeRecognition.shapes[shape];
            const label = capitalizeFirst(basicShapeLabel(shape, t));
            return (
              <Pressable
                key={shape}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled}
                onPress={() => toggleShape(shape)}
                style={[
                  styles.chip,
                  selected && styles.chipSelected,
                  disabled && styles.chipDisabled,
                ]}
              >
                <AppText
                  variant="label"
                  style={selected ? styles.chipTextSelected : styles.chipText}
                >
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </OperationConfigCard>
  );
}

const styles = StyleSheet.create({
  questionTypes: { marginTop: spacing.sm, gap: spacing.xs },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  switchLabel: { flex: 1 },
  section: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.primary,
  },
});
