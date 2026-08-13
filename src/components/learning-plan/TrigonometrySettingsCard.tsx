import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import type { TrigonometryConfig } from '@/features/trigonometry/trigonometry.types';
import { TRIG_RATIO_LABELS } from '@/features/trigonometry/trigonometryFormulas';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type TrigonometrySettingsCardProps = {
  trigonometry: TrigonometryConfig;
  onChange: (trigonometry: TrigonometryConfig) => void;
};

const RATIO_TOGGLES = [
  { key: 'sin' as const, labelKey: 'settings:sine' },
  { key: 'cos' as const, labelKey: 'settings:cosine' },
  { key: 'tan' as const, labelKey: 'settings:tangent' },
  { key: 'cot' as const, labelKey: 'settings:cotangent' },
] as const;

export function TrigonometrySettingsCard({
  trigonometry,
  onChange,
}: TrigonometrySettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const disabled = !trigonometry.enabled;

  return (
    <OperationConfigCard
      operation="trigonometry"
      enabled={trigonometry.enabled}
      onToggle={(enabled) => onChange({ ...trigonometry, enabled })}
    >
      <AppText variant="body" muted>
        {t('settings:trigonometryDesc')}
      </AppText>

      <View style={styles.section}>
        <AppText variant="label" muted>
          {t('settings:questionTypes')}
        </AppText>
        <View style={styles.chipRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings:pickFormula')}
            accessibilityState={{ selected: trigonometry.questionKinds.pickFormula }}
            disabled={disabled}
            onPress={() =>
              onChange({
                ...trigonometry,
                questionKinds: {
                  ...trigonometry.questionKinds,
                  pickFormula: !trigonometry.questionKinds.pickFormula,
                },
              })
            }
            style={[
              styles.chip,
              trigonometry.questionKinds.pickFormula && styles.chipSelected,
              disabled && styles.chipDisabled,
            ]}
          >
            <AppText
              variant="label"
              style={
                trigonometry.questionKinds.pickFormula
                  ? styles.chipTextSelected
                  : styles.chipText
              }
            >
              {t('settings:pickFormula')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings:nameSides')}
            accessibilityState={{ selected: trigonometry.questionKinds.nameSide }}
            disabled={disabled}
            onPress={() =>
              onChange({
                ...trigonometry,
                questionKinds: {
                  ...trigonometry.questionKinds,
                  nameSide: !trigonometry.questionKinds.nameSide,
                },
              })
            }
            style={[
              styles.chip,
              trigonometry.questionKinds.nameSide && styles.chipSelected,
              disabled && styles.chipDisabled,
            ]}
          >
            <AppText
              variant="label"
              style={
                trigonometry.questionKinds.nameSide
                  ? styles.chipTextSelected
                  : styles.chipText
              }
            >
              {t('settings:nameSides')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings:findAngle')}
            accessibilityState={{ selected: trigonometry.questionKinds.findAngle }}
            disabled={disabled || !trigonometry.questionKinds.pickFormula}
            onPress={() =>
              onChange({
                ...trigonometry,
                questionKinds: {
                  ...trigonometry.questionKinds,
                  findAngle: !trigonometry.questionKinds.findAngle,
                },
              })
            }
            style={[
              styles.chip,
              trigonometry.questionKinds.findAngle && styles.chipSelected,
              (disabled || !trigonometry.questionKinds.pickFormula) && styles.chipDisabled,
            ]}
          >
            <AppText
              variant="label"
              style={
                trigonometry.questionKinds.findAngle
                  ? styles.chipTextSelected
                  : styles.chipText
              }
            >
              {t('settings:findAngle')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="label" muted>
          {t('settings:pickFormula')}
        </AppText>
        <View style={styles.chipRow}>
          {RATIO_TOGGLES.map(({ key, labelKey }) => {
            const selected = trigonometry.ratios[key];
            const label = t(labelKey);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled || !trigonometry.questionKinds.pickFormula}
                onPress={() =>
                  onChange({
                    ...trigonometry,
                    ratios: { ...trigonometry.ratios, [key]: !trigonometry.ratios[key] },
                  })
                }
                style={[
                  styles.chip,
                  selected && styles.chipSelected,
                  (disabled || !trigonometry.questionKinds.pickFormula) && styles.chipDisabled,
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
        <AppText variant="body" muted style={styles.ratioHint}>
          {TRIG_RATIO_LABELS.sin}
        </AppText>
      </View>
    </OperationConfigCard>
  );
}

const styles = StyleSheet.create({
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
  ratioHint: {
    marginTop: spacing.xs,
  },
});
