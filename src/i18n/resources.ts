import questionsEn from '@/i18n/locales/en/questions.json';
import commonEn from '@/i18n/locales/en/common.json';
import homeEn from '@/i18n/locales/en/home.json';
import navigationEn from '@/i18n/locales/en/navigation.json';
import onboardingEn from '@/i18n/locales/en/onboarding.json';
import practiceEn from '@/i18n/locales/en/practice.json';
import privacyEn from '@/i18n/locales/en/privacy.json';
import progressEn from '@/i18n/locales/en/progress.json';
import settingsEn from '@/i18n/locales/en/settings.json';
import questionsMk from '@/i18n/locales/mk/questions.json';
import commonMk from '@/i18n/locales/mk/common.json';
import homeMk from '@/i18n/locales/mk/home.json';
import navigationMk from '@/i18n/locales/mk/navigation.json';
import onboardingMk from '@/i18n/locales/mk/onboarding.json';
import practiceMk from '@/i18n/locales/mk/practice.json';
import privacyMk from '@/i18n/locales/mk/privacy.json';
import progressMk from '@/i18n/locales/mk/progress.json';
import settingsMk from '@/i18n/locales/mk/settings.json';

export const resources = {
  en: {
    common: commonEn,
    navigation: navigationEn,
    home: homeEn,
    onboarding: onboardingEn,
    settings: settingsEn,
    practice: practiceEn,
    progress: progressEn,
    privacy: privacyEn,
    questions: questionsEn,
  },
  mk: {
    common: commonMk,
    navigation: navigationMk,
    home: homeMk,
    onboarding: onboardingMk,
    settings: settingsMk,
    practice: practiceMk,
    progress: progressMk,
    privacy: privacyMk,
    questions: questionsMk,
  },
} as const;
