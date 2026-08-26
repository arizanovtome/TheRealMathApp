import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from './OperationConfigCard';
import type { AdvancedEquationsConfig } from '@/features/advanced-equations/advancedEquations.types';
import type { LimitsConfig } from '@/features/limits/limits.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

function Chips<T extends { enabled: boolean }>({ operation, config, onChange, descriptionKey, items }: {
  operation: 'advanced_equations' | 'limits'; config: T; onChange: (value: T) => void;
  descriptionKey: string; items: readonly { key: keyof T; labelKey: string }[];
}) {
  const { t } = useAppTranslation(['settings']);
  return <OperationConfigCard operation={operation} enabled={config.enabled} onToggle={(enabled) => onChange({ ...config, enabled })}>
    <AppText variant="body" muted>{t(descriptionKey)}</AppText>
    <View style={styles.section}><AppText variant="label" muted>{t('settings:questionTypes')}</AppText>
      <View style={styles.row}>{items.map(({ key, labelKey }) => {
        const selected = Boolean(config[key]);
        return <Pressable key={String(key)} disabled={!config.enabled} onPress={() => onChange({ ...config, [key]: !selected })}
          style={[styles.chip, selected && styles.selected, !config.enabled && styles.disabled]}>
          <AppText variant="label" style={selected ? styles.selectedText : styles.text}>{t(labelKey)}</AppText>
        </Pressable>;
      })}</View>
    </View>
  </OperationConfigCard>;
}

export function AdvancedEquationsSettingsCard({ config, onChange }: { config: AdvancedEquationsConfig; onChange: (v: AdvancedEquationsConfig) => void }) {
  return <Chips operation="advanced_equations" config={config} onChange={onChange} descriptionKey="settings:advancedEquationsDesc" items={[
    { key: 'multiStepLinear', labelKey: 'settings:multiStepLinear' },
    { key: 'variablesBothSides', labelKey: 'settings:variablesBothSides' },
    { key: 'linearParentheses', labelKey: 'settings:linearParentheses' },
    { key: 'factorableQuadratic', labelKey: 'settings:factorableQuadratic' },
  ]} />;
}

export function LimitsSettingsCard({ config, onChange }: { config: LimitsConfig; onChange: (v: LimitsConfig) => void }) {
  return <Chips operation="limits" config={config} onChange={onChange} descriptionKey="settings:limitsDesc" items={[
    { key: 'directSubstitution', labelKey: 'settings:directSubstitutionLimits' },
    { key: 'factorAndCancel', labelKey: 'settings:factorCancelLimits' },
    { key: 'limitsAtInfinity', labelKey: 'settings:limitsAtInfinity' },
    { key: 'rationalization', labelKey: 'settings:rationalizationLimits' },
  ]} />;
}

const styles = StyleSheet.create({ section: { marginTop: spacing.sm, gap: spacing.xs }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, chip: { borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.surface }, selected: { borderColor: colors.primary, backgroundColor: colors.chipSelected }, disabled: { opacity: 0.5 }, text: { color: colors.textMuted }, selectedText: { color: colors.primary } });
