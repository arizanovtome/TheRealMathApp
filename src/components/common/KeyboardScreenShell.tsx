import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, StyleSheet, View, type ViewStyle } from 'react-native';

import {
  keyboardAvoidingPaddingBehavior,
  shouldUseKeyboardAvoidingView,
} from '@/utils/keyboardAvoidance';

type KeyboardScreenShellProps = PropsWithChildren<{
  style?: ViewStyle;
  keyboardVerticalOffset?: number;
}>;

/** iOS: KeyboardAvoidingView. Android: plain flex container (OS resize handles the keyboard). */
export function KeyboardScreenShell({
  children,
  style,
  keyboardVerticalOffset = 0,
}: KeyboardScreenShellProps) {
  if (!shouldUseKeyboardAvoidingView) {
    return <View style={[styles.root, style]}>{children}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, style]}
      behavior={keyboardAvoidingPaddingBehavior()}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
