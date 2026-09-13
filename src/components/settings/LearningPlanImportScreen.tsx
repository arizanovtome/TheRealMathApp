import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { LearningPlanImportPreview } from '@/components/settings/LearningPlanImportPreview';
import type { LearningPlanImportResult } from '@/features/learning-plan/learningPlanExport.types';
import { PROFILE_NAME_MAX_LENGTH } from '@/constants/inputLimits';
import { ROUTES } from '@/constants/routes';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { pickAndParseLearningPlanFile } from '@/features/learning-plan/learningPlanShare.service';
import {
  createChildProfile,
  nextDefaultProfileName,
} from '@/features/onboarding/profile.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { selectActiveProfile } from '@/store/profileSelectors';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type ImportMode = 'new' | 'replace';

type PickedPlan = {
  fileName: string;
  label: string | null;
  config: MathLearningConfig;
};

function importErrorMessage(
  reason: string,
  t: ReturnType<typeof useAppTranslation>['t'],
): string {
  switch (reason) {
    case 'invalid_json':
      return t('settings:importPlanErrorInvalidJson');
    case 'too_large':
      return t('settings:importPlanErrorTooLarge');
    case 'wrong_kind':
      return t('settings:importPlanErrorWrongKind');
    case 'unsupported_version':
      return t('settings:importPlanErrorUnsupportedVersion');
    case 'missing_config':
    case 'invalid_config':
      return t('settings:importPlanErrorInvalidConfig');
    case 'read_failed':
      return t('settings:importPlanErrorReadFailed');
    default:
      return t('settings:importPlanErrorInvalidConfig');
  }
}

export function LearningPlanImportScreen() {
  const { t } = useAppTranslation(['settings', 'common', 'onboarding']);
  const router = useRouter();
  const profiles = useAppStore((state) => state.profiles);
  const activeProfile = useAppStore(selectActiveProfile);
  const addProfile = useAppStore((state) => state.addProfile);
  const updateProfile = useAppStore((state) => state.updateProfile);

  const [picked, setPicked] = useState<PickedPlan | null>(null);
  const [profileName, setProfileName] = useState('');
  const [mode, setMode] = useState<ImportMode>('new');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultProfileName = useMemo(() => nextDefaultProfileName(profiles), [profiles]);

  const effectiveProfileName = profileName.trim() || defaultProfileName;
  const canImport = picked != null && effectiveProfileName.length > 0;

  const acceptPlan = useCallback((parsed: LearningPlanImportResult, fileName: string) => {
    setPicked(null);
    if (!parsed.ok) { setError(importErrorMessage(parsed.error, t)); return; }
    setError(null);
    setPicked({ fileName, label: parsed.label, config: parsed.config });
    setProfileName((current) => current.trim() ? current : parsed.label ?? defaultProfileName);
  }, [defaultProfileName, t]);

  const chooseFile = useCallback(async () => {
    setError(null);
    setBusy(true);
    setPicked(null);
    try {
      const result = await pickAndParseLearningPlanFile();
      if (!result.ok) {
        if (result.reason !== 'cancelled') {
          setError(importErrorMessage(result.reason, t));
        }
        return;
      }
      acceptPlan(result.parsed, result.fileName);
    } catch (error) {
      setError(`${t('settings:importPlanErrorReadFailed')}\n${String(error)}`);
    } finally {
      setBusy(false);
    }
  }, [acceptPlan, t]);

  const applyImport = useCallback(() => {
    if (!picked || !canImport) return;

    const runImport = () => {
      if (mode === 'replace') {
        if (!activeProfile) return;
        updateProfile(activeProfile.id, { learningConfig: picked.config });
        router.back();
        return;
      }

      const profile = createChildProfile({
        profileName: effectiveProfileName,
        name: t('common:friend'),
        age: null,
        mathKnowledgeLevel: null,
        learningConfig: picked.config,
      });
      addProfile(profile);
      router.replace(ROUTES.learningPlan);
    };

    if (mode === 'replace' && activeProfile) {
      Alert.alert(
        t('settings:importPlanReplaceTitle'),
        t('settings:importPlanReplaceBody', { profile: activeProfile.profileName }),
        [
          { text: t('common:cancel'), style: 'cancel' },
          { text: t('settings:importPlanReplaceConfirm'), style: 'destructive', onPress: runImport },
        ],
      );
      return;
    }

    runImport();
  }, [
    activeProfile,
    addProfile,
    canImport,
    effectiveProfileName,
    mode,
    picked,
    router,
    t,
    updateProfile,
  ]);

  if (!activeProfile) return <Redirect href={ROUTES.onboardingName} />;

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('settings:importPlanTitle')}</AppText>
      <AppText variant="body" muted>
        {t('settings:importPlanHint')}
      </AppText>
      <AppText variant="body" muted>
        {t('settings:importPlanPrivacyHint')}
      </AppText>

      <Card>
        <AppButton
          label={picked ? t('settings:importPlanChooseAnother') : t('settings:importPlanChooseFile')}
          icon="folder-open-outline"
          variant="secondary"
          onPress={() => void chooseFile()}
          disabled={busy}
        />
        {picked ? (
          <AppText variant="body" muted style={styles.fileName}>
            {t('settings:importPlanSelectedFile', { file: picked.fileName })}
          </AppText>
        ) : null}
        {error ? (
          <AppText variant="body" style={styles.error}>
            {error}
          </AppText>
        ) : null}
      </Card>

      {picked ? (
        <Card>
          <LearningPlanImportPreview config={picked.config} />
          <AppText variant="subtitle">{t('settings:importPlanDestinationTitle')}</AppText>
          <AppText variant="body" muted>
            {t('settings:importPlanProfileNameHint')}
          </AppText>
          <View style={styles.field}>
            <AppText variant="label">{t('onboarding:profileName')}</AppText>
            <TextInput
              accessibilityLabel={t('onboarding:profileName')}
              placeholder={t('onboarding:profileNamePlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={profileName}
              onChangeText={setProfileName}
              autoCapitalize="words"
              maxLength={PROFILE_NAME_MAX_LENGTH}
              style={styles.input}
            />
          </View>
          <AppText variant="body" muted>
            {t('settings:importPlanLearnerNameHint', { name: t('common:friend') })}
          </AppText>

          <View style={styles.modeRow}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: mode === 'new' }}
              onPress={() => setMode('new')}
              style={[styles.modeOption, mode === 'new' && styles.modeOptionSelected]}
            >
              <AppText variant="body" style={mode === 'new' ? styles.modeTextSelected : undefined}>
                {t('settings:importPlanModeNew')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: mode === 'replace' }}
              onPress={() => setMode('replace')}
              style={[styles.modeOption, mode === 'replace' && styles.modeOptionSelected]}
            >
              <AppText variant="body" style={mode === 'replace' ? styles.modeTextSelected : undefined}>
                {t('settings:importPlanModeReplace', { profile: activeProfile.profileName })}
              </AppText>
            </Pressable>
          </View>

          <AppButton
            label={t('settings:importPlanConfirm')} icon="checkmark"
            textPosition="center"
            iconPosition="right"
            onPress={applyImport}
            disabled={!canImport || busy}
          />
        </Card>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  fileName: {
    marginTop: spacing.sm,
  },
  error: {
    marginTop: spacing.sm,
    color: colors.error,
  },
  modeRow: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  modeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  modeTextSelected: {
    color: colors.primary,
  },
});
