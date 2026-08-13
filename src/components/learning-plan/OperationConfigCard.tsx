import { useContext, useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { getOperationLabel } from '@/constants/operationLabels';
import type { MathOperation } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { FocusedOperationContext } from '@/components/learning-plan/FocusedOperationContext';

type OperationConfigCardProps = PropsWithChildren<{
  operation?: MathOperation;
  /** Used when `operation` is not set (e.g. systems of equations). */
  title?: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  /** Shown when the section is off. Defaults to a generic line using the title. */
  offHint?: string;
}>;

export function OperationConfigCard({
  operation,
  title,
  enabled,
  onToggle,
  offHint,
  children,
}: OperationConfigCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const [collapsed, setCollapsed] = useState(false);
  const focusedOperation = useContext(FocusedOperationContext);
  const displayTitle =
    operation != null ? getOperationLabel(operation, t) : (title ?? '');

  if (focusedOperation && operation !== focusedOperation) return null;

  return (
    <Card>
      <View style={styles.header}>
        <Pressable
          accessibilityRole={enabled ? 'button' : undefined}
          accessibilityLabel={
            enabled
              ? `${displayTitle}. ${t(collapsed ? 'settings:expandSection' : 'settings:collapseSection')}`
              : displayTitle
          }
          accessibilityState={enabled ? { expanded: !collapsed } : undefined}
          disabled={!enabled}
          hitSlop={8}
          onPress={() => setCollapsed((value) => !value)}
          style={styles.titleWrap}
        >
          <AppText variant="subtitle" style={styles.title}>
            {displayTitle}
          </AppText>
        </Pressable>
        <View style={styles.switchWrap}>
          <Switch
            accessibilityLabel={t('common:enableTopicA11y', { title: displayTitle })}
            value={enabled}
            onValueChange={onToggle}
            thumbColor="#ffffff"
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>
      {enabled ? (
        collapsed ? null : children
      ) : (
        <AppText muted>
          {offHint ?? t('common:enableTopic', { title: displayTitle.toLowerCase() })}
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleWrap: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  title: {
    flexShrink: 1,
  },
  switchWrap: {
    flexShrink: 0,
    marginTop: 2,
  },
});
