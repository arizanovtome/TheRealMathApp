import { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';
import {
  formatSessionDayLabel,
  formatSessionHistoryDetailLines,
  formatSessionModeLabel,
} from '@/features/progress/sessionLabels';
import type { SupportedLocale } from '@/i18n/types';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type RecentSessionRowProps = {
  entry: SessionHistoryEntry;
  locale: SupportedLocale;
  t: TFunction;
};

export function RecentSessionRow({ entry, locale, t }: RecentSessionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const detailLines = useMemo(
    () => formatSessionHistoryDetailLines(entry, t),
    [entry, t],
  );

  const summaryLabel = [
    formatSessionDayLabel(entry.completedAt, locale, t),
    formatSessionModeLabel(entry.sessionMode, t),
    `${entry.scorePercentage} percent`,
  ].join(', ');

  const detailsLabel = detailLines.join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={summaryLabel}
      accessibilityHint={expanded ? t('progress:sessionCollapseA11y') : t('progress:sessionExpandA11y')}
      onPress={() => setExpanded((open) => !open)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowMain}>
        <AppText variant="body" style={styles.when}>
          {formatSessionDayLabel(entry.completedAt, locale, t)}
        </AppText>
        <View style={styles.modeBadge}>
          <AppText variant="label" style={styles.modeText}>
            {formatSessionModeLabel(entry.sessionMode, t)}
          </AppText>
        </View>
        <AppText variant="body" style={styles.pct}>
          {entry.scorePercentage}%
        </AppText>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
          style={styles.chevron}
        />
      </View>
      {expanded ? (
        <View style={styles.details} accessibilityRole="text" accessibilityLabel={detailsLabel}>
          {detailLines.map((line, lineIndex) => (
            <AppText key={lineIndex} variant="body" muted style={styles.detailLine}>
              {line}
            </AppText>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.boardDeep,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  when: {
    flex: 1,
    color: colors.textMuted,
    fontWeight: '600',
  },
  modeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.primary,
    fontSize: 11,
  },
  pct: {
    fontWeight: '700',
    color: colors.text,
    minWidth: 44,
    textAlign: 'right',
  },
  chevron: {
    marginLeft: -spacing.xs,
  },
  details: {
    gap: 2,
    paddingTop: 2,
  },
  detailLine: {
    lineHeight: 20,
  },
});
