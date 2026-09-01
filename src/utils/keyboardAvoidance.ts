import { Platform } from 'react-native';

/** Android uses window resize (adjustResize); KeyboardAvoidingView fights it and breaks layout. */
export const shouldUseKeyboardAvoidingView = Platform.OS === 'ios';

export function keyboardAvoidingPaddingBehavior(): 'padding' | undefined {
  return shouldUseKeyboardAvoidingView ? 'padding' : undefined;
}
