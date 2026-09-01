import { InteractionManager, Keyboard, Platform } from 'react-native';

/**
 * Runs a navigation action after keyboard dismiss and layout settle.
 * Android react-native-screens can crash when header options change during a transition.
 */
export function deferNavigationAction(action: () => void): void {
  Keyboard.dismiss();
  InteractionManager.runAfterInteractions(() => {
    if (Platform.OS === 'android') {
      requestAnimationFrame(() => {
        setTimeout(action, 50);
      });
      return;
    }
    action();
  });
}
