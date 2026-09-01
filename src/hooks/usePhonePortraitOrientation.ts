import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

/** Android 16+ ignores portrait locks on large screens (sw >= 600dp). Keep phones portrait-only. */
export function usePhonePortraitOrientation() {
  const { width, height } = useWindowDimensions();
  const isLargeScreen = Math.min(width, height) >= 600;

  useEffect(() => {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') return;

    async function applyOrientationLock() {
      if (isLargeScreen) {
        await ScreenOrientation.unlockAsync();
        return;
      }
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }

    void applyOrientationLock();

    return () => {
      void ScreenOrientation.unlockAsync();
    };
  }, [isLargeScreen]);
}
