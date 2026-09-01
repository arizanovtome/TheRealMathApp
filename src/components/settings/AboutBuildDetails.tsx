import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { formatBuildStampDate } from '@/features/updates/buildInfo.utils';
import { buildTesterUpdateInfo } from '@/features/updates/updateInfo.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function AboutBuildDetails() {
  const { t, locale } = useAppTranslation(['settings', 'common']);
  const info = buildTesterUpdateInfo();

  const showRuntime =
    info.runtimeVersion != null &&
    info.appVersion != null &&
    info.runtimeVersion !== info.appVersion;

  const stampedAt = info.buildStamp.stampedAt;
  const packageMessage =
    info.updateMessage ?? info.buildStamp.label ?? t('settings:testerUpdateNoMessage');

  return (
    <View style={styles.wrap}>
      <Card>
        <AppText variant="subtitle">{t('settings:aboutAppVersion')}</AppText>
        <AppText variant="title" style={styles.version}>
          {info.appVersion ?? '—'}
        </AppText>
        {showRuntime ? (
          <AppText variant="body" muted style={styles.line}>
            {t('settings:testerUpdateRuntime', { version: info.runtimeVersion })}
          </AppText>
        ) : null}
        {info.channel ? (
          <AppText variant="body" muted style={styles.line}>
            {t('settings:testerUpdateChannel', { channel: info.channel })}
          </AppText>
        ) : null}
      </Card>

      <Card>
        <AppText variant="subtitle">{t('settings:testerUpdateTitle')}</AppText>
        <AppText variant="label" muted style={styles.label}>
          {t('settings:testerBuildStampLabel')}
        </AppText>
        {stampedAt ? (
          <AppText variant="body" style={styles.stampDate}>
            {formatBuildStampDate(stampedAt, locale)}
          </AppText>
        ) : (
          <AppText variant="body" muted style={styles.line}>
            {t('settings:testerBuildStampNone')}
          </AppText>
        )}
        <AppText variant="label" muted style={styles.label}>
          {t('settings:testerUpdateMessageLabel')}
        </AppText>
        <AppText variant="body" muted style={styles.message} selectable>
          {packageMessage}
        </AppText>
        {info.isEmbeddedLaunch && !info.updateId && !info.isDevelopment ? (
          <AppText variant="body" muted style={styles.hint}>
            {t('settings:testerUpdateEmbeddedHint')}
          </AppText>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  version: {
    marginTop: spacing.xs,
    color: colors.primary,
  },
  line: {
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  stampDate: {
    marginTop: spacing.xs,
    lineHeight: 24,
  },
  hint: {
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  label: {
    marginTop: spacing.sm,
  },
  message: {
    lineHeight: 22,
  },
});
