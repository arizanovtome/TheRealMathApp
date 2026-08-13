import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { CompactSwitch } from '@/components/learning-plan/CompactSwitch';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import type {
  AreaShape,
  GeometryConfig,
  PerimeterShape,
} from '@/features/geometry/geometry.types';
import { VOLUME_SHAPES, PLANAR_SHAPES } from '@/features/geometry/geometry.types';
import type { GeometryShape } from '@/features/geometry/geometry.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { localizedShapeLabel } from '@/i18n/labels';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

const PERIMETER_SHAPES: PerimeterShape[] = [...PLANAR_SHAPES];
const AREA_SHAPES: AreaShape[] = [...PLANAR_SHAPES];

type GeometrySettingsCardProps = {
  geometry: GeometryConfig;
  onChange: (geometry: GeometryConfig) => void;
};

function ShapeChipRow<T extends string>({
  shapes,
  flags,
  disabled,
  onToggle,
}: {
  shapes: readonly T[];
  flags: Record<T, boolean>;
  disabled: boolean;
  onToggle: (shape: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {shapes.map((shape) => {
        const selected = flags[shape];
        const label = localizedShapeLabel(shape as GeometryShape);
        return (
          <Pressable
            key={shape}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            disabled={disabled}
            onPress={() => onToggle(shape)}
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
  );
}

export function GeometrySettingsCard({ geometry, onChange }: GeometrySettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const disabled = !geometry.enabled;

  const setMeasureEnabled = (
    measure: 'perimeter' | 'area' | 'volume',
    enabled: boolean,
  ) => {
    onChange({ ...geometry, [measure]: { ...geometry[measure], enabled } });
  };

  const toggleShape = <T extends string>(
    measure: 'perimeter' | 'area' | 'volume',
    shape: T,
  ) => {
    const section = geometry[measure];
    onChange({
      ...geometry,
      [measure]: {
        ...section,
        shapes: {
          ...section.shapes,
          [shape]: !section.shapes[shape as keyof typeof section.shapes],
        },
      },
    });
  };

  return (
    <OperationConfigCard
      operation="geometry"
      enabled={geometry.enabled}
      onToggle={(enabled) => onChange({ ...geometry, enabled })}
    >
      <AppText variant="body" muted>
        {t('settings:geometryDesc')}
      </AppText>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <AppText variant="label" style={styles.measureLabel}>
            {t('settings:perimeter')}
          </AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:perimeter')}
            value={geometry.perimeter.enabled}
            onValueChange={(enabled) => setMeasureEnabled('perimeter', enabled)}
            disabled={disabled}
          />
        </View>
        <ShapeChipRow
          shapes={PERIMETER_SHAPES}
          flags={geometry.perimeter.shapes}
          disabled={disabled || !geometry.perimeter.enabled}
          onToggle={(shape) => toggleShape('perimeter', shape)}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <AppText variant="label" style={styles.measureLabel}>
            {t('settings:area')}
          </AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:area')}
            value={geometry.area.enabled}
            onValueChange={(enabled) => setMeasureEnabled('area', enabled)}
            disabled={disabled}
          />
        </View>
        <ShapeChipRow
          shapes={AREA_SHAPES}
          flags={geometry.area.shapes}
          disabled={disabled || !geometry.area.enabled}
          onToggle={(shape) => toggleShape('area', shape)}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <AppText variant="label" style={styles.measureLabel}>
            {t('settings:volume')}
          </AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:volume')}
            value={geometry.volume.enabled}
            onValueChange={(enabled) => setMeasureEnabled('volume', enabled)}
            disabled={disabled}
          />
        </View>
        <ShapeChipRow
          shapes={VOLUME_SHAPES}
          flags={geometry.volume.shapes}
          disabled={disabled || !geometry.volume.enabled}
          onToggle={(shape) => toggleShape('volume', shape)}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="label">{t('settings:questionTypes')}</AppText>
        <View style={styles.chipRow}>
          {(['formula', 'calculate'] as const).map((kind) => {
            const selected = geometry.questionKinds[kind];
            const label = kind === 'formula' ? t('common:formula') : t('common:calculate');
            return (
              <Pressable
                key={kind}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled}
                onPress={() =>
                  onChange({
                    ...geometry,
                    questionKinds: {
                      ...geometry.questionKinds,
                      [kind]: !geometry.questionKinds[kind],
                    },
                  })
                }
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

      <AppText variant="body" muted>
        {t('settings:geometryChoicesHint')}
      </AppText>
    </OperationConfigCard>
  );
}

export function patchGeometryInConfig(
  config: MathLearningConfig,
  geometry: GeometryConfig,
): MathLearningConfig {
  return { ...config, geometry };
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  measureLabel: {
    flex: 1,
    flexShrink: 1,
    paddingRight: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.primary,
  },
});
