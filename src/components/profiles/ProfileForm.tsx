import { StyleSheet, TextInput, View } from 'react-native';

import { AgeNumberInput } from '@/components/common/AgeNumberInput';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { MathKnowledgeSelector } from '@/components/profiles/MathKnowledgeSelector';
import {
  LEARNER_NAME_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
} from '@/constants/inputLimits';
import { DEFAULT_MATH_KNOWLEDGE_LEVEL, type MathKnowledgeLevel } from '@/constants/mathKnowledge';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

export type ProfileFormValues = {
  profileName: string;
  name: string;
  age: number | null;
  mathKnowledgeLevel: MathKnowledgeLevel;
};

type ProfileFormProps = {
  mode: 'add' | 'edit';
  profileName: string;
  name: string;
  age: number | null;
  mathKnowledgeLevel: MathKnowledgeLevel;
  onProfileNameChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onAgeChange: (value: number | null) => void;
  onMathKnowledgeLevelChange: (value: MathKnowledgeLevel) => void;
  onSave: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
  showTitle?: boolean;
};

export function profileFormInitialValues(overrides?: Partial<ProfileFormValues>): ProfileFormValues {
  return {
    profileName: overrides?.profileName ?? '',
    name: overrides?.name ?? '',
    age: overrides?.age ?? null,
    mathKnowledgeLevel: overrides?.mathKnowledgeLevel ?? DEFAULT_MATH_KNOWLEDGE_LEVEL,
  };
}

export function ProfileForm({
  mode,
  profileName,
  name,
  age,
  mathKnowledgeLevel,
  onProfileNameChange,
  onNameChange,
  onAgeChange,
  onMathKnowledgeLevelChange,
  onSave,
  onCancel,
  saveDisabled = false,
  showTitle = true,
}: ProfileFormProps) {
  const { t } = useAppTranslation(['settings', 'onboarding', 'common']);

  const canSave =
    !saveDisabled && profileName.trim().length > 0 && name.trim().length > 0;

  return (
    <Card>
      {showTitle ? (
        <AppText variant="subtitle">
          {mode === 'add' ? t('settings:addProfileFormTitle') : t('settings:editProfileFormTitle')}
        </AppText>
      ) : null}

      <View style={styles.fields}>
        <View style={styles.field}>
          <AppText variant="label">{t('onboarding:profileName')}</AppText>
          <TextInput
            accessibilityLabel={t('onboarding:profileName')}
            placeholder={t('onboarding:profileNamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={profileName}
            onChangeText={onProfileNameChange}
            autoCapitalize="words"
            maxLength={PROFILE_NAME_MAX_LENGTH}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <AppText variant="label">{t('onboarding:nameOrNickname')}</AppText>
          <TextInput
            accessibilityLabel={t('onboarding:nameOrNickname')}
            placeholder={t('onboarding:namePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={onNameChange}
            autoCapitalize="words"
            maxLength={LEARNER_NAME_MAX_LENGTH}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <AppText variant="label">{t('settings:ageOptional')}</AppText>
          <AppText variant="body" muted>
            {t('settings:ageOptionalHint')}
          </AppText>
          <AgeNumberInput
            value={age}
            onChange={onAgeChange}
            accessibilityLabel={t('settings:ageOptional')}
            placeholder={t('settings:ageOptionalPlaceholder')}
          />
        </View>

        <View style={styles.field}>
          <AppText variant="label">{t('settings:mathKnowledgeTitle')}</AppText>
          <AppText variant="body" muted>
            {t('settings:mathKnowledgeHint')}
          </AppText>
          <MathKnowledgeSelector
            value={mathKnowledgeLevel}
            onChange={onMathKnowledgeLevelChange}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label={mode === 'add' ? t('common:addProfile') : t('common:save')}
          onPress={onSave}
          disabled={!canSave}
        />
        <AppButton label={t('common:cancel')} variant="secondary" onPress={onCancel} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  field: {
    gap: spacing.xs,
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
