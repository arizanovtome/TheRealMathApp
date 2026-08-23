import type { PropsWithChildren, RefObject } from 'react';
import { useCallback } from 'react';
import type { ScrollView } from 'react-native';

/** Scrolls a ScrollView so bottom inputs stay visible when the keyboard opens. */
export function useScrollToFocusedInput(scrollRef: RefObject<ScrollView | null>) {
  return useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [scrollRef]);
}
