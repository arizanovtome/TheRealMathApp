import { initI18n } from '@/i18n';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeAll(async () => {
  await initI18n('en');
});
