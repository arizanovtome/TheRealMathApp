import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { CompactSwitch } from '@/components/learning-plan/CompactSwitch';
import { DiscreteMaxSlider } from '@/components/learning-plan/DiscreteMaxSlider';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import type { NumberSenseConfig } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { spacing } from '@/theme/spacing';

const TYPES = ['beforeAfter','missingNumber','oddEven'] as const;
const NUMBER_LIMIT_OPTIONS = [5, 10, 20, 100] as const;
export function NumberSenseSettingsCard({ value, onChange }: { value: NumberSenseConfig; onChange: (v: NumberSenseConfig) => void }) {
  const { t } = useAppTranslation(['settings']);
  return <OperationConfigCard operation="number_sense" enabled={value.enabled} onToggle={enabled => onChange({...value, enabled})}>
    <AppText muted>{t('settings:numberSenseDesc')}</AppText>
    <View style={styles.group}>{TYPES.map(key => <View key={key} style={styles.row}>
      <AppText variant="label" style={styles.label}>{t(`settings:${key}`)}</AppText>
      <CompactSwitch accessibilityLabel={t(`settings:${key}`)} value={value[key]} disabled={!value.enabled} onValueChange={selected => onChange({...value, [key]: selected})}/>
    </View>)}</View>
    <DiscreteMaxSlider
      accessibilityLabel={t('settings:numbersUpTo')}
      disabled={!value.enabled}
      options={NUMBER_LIMIT_OPTIONS}
      valueMax={value.maxNumber}
      onChange={(maxNumber) =>
        onChange({ ...value, maxNumber: maxNumber as NumberSenseConfig['maxNumber'] })
      }
    />
  </OperationConfigCard>;
}
const styles = StyleSheet.create({group:{gap:spacing.xs,marginVertical:spacing.sm},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},label:{flex:1}});
