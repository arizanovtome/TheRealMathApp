import type { RefObject } from 'react';
import { useCallback, useEffect } from 'react';
import { Keyboard, Platform, type ScrollView } from 'react-native';

/** Scrolls a ScrollView so bottom inputs stay visible when the keyboard opens. */
export function useScrollToFocusedInput(scrollRef: RefObject<ScrollView | null>) {
  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [scrollRef]);

  useEffect(() => {
    // The focus event fires before Android has resized the window. Waiting for
    // the keyboard event ensures the ScrollView uses its final visible height.
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(event, scrollToEnd);

    return () => subscription.remove();
  }, [scrollToEnd]);

  return scrollToEnd;
}
