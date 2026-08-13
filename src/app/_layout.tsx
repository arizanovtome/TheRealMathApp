import '@/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { TFunction } from 'i18next';

import { stackScreenTitle } from '@/constants/stackScreenTitles';
import { initI18n, i18n } from '@/i18n';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useStoreHydration } from '@/hooks/useStoreHydration';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme/colors';

function RootStack() {
  const { t } = useAppTranslation(['navigation', 'common']);

  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '600', fontSize: 18 },
        contentStyle: { backgroundColor: colors.background },
        title: stackScreenTitle(route.name, t as TFunction),
        headerBackButtonDisplayMode: 'minimal',
        ...(route.name === 'result' || route.name === 'result/index'
          ? { gestureEnabled: false, fullScreenGestureEnabled: false }
          : { gestureEnabled: true, fullScreenGestureEnabled: true }),
      })}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

function I18nGate({ children }: { children: React.ReactNode }) {
  const hydrated = useStoreHydration();
  const locale = useAppStore((s) => s.locale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void initI18n(locale).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [locale]);

  if (!hydrated || !ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nGate>
        <RootStack />
      </I18nGate>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
