import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform, type ScrollView } from 'react-native';

/** Fraction of keyboard height the window must shrink to count as OS-handled resize. */
const RESIZE_DETECTION_RATIO = 0.4;

function androidNeedsManualKeyboardInset(
  keyboardHeight: number,
  baselineHeight: number,
): boolean {
  const currentHeight = Dimensions.get('window').height;
  const shrunk = baselineHeight - currentHeight;
  return shrunk < keyboardHeight * RESIZE_DETECTION_RATIO;
}

function scheduleScrollToEnd(scrollRef: RefObject<ScrollView | null>) {
  const run = () => scrollRef.current?.scrollToEnd({ animated: true });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (Platform.OS === 'android') {
        setTimeout(run, 100);
      } else {
        run();
      }
    });
  });
}

/**
 * Keyboard height to add as ScrollView bottom padding.
 * On Android, returns 0 when adjustResize already shrank the window (avoids double gap).
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  const baselineHeightRef = useRef(Dimensions.get('window').height);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = event.endCoordinates.height;

      if (Platform.OS === 'android') {
        setInset(
          androidNeedsManualKeyboardInset(keyboardHeight, baselineHeightRef.current)
            ? keyboardHeight
            : 0,
        );
      } else {
        setInset(keyboardHeight);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setInset(0);
      baselineHeightRef.current = Dimensions.get('window').height;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return inset;
}

/** Scrolls a ScrollView so bottom inputs stay visible when the keyboard opens. */
export function useScrollToFocusedInput(
  scrollRef: RefObject<ScrollView | null>,
  keyboardInset = 0,
) {
  const scrollToEnd = useCallback(() => {
    scheduleScrollToEnd(scrollRef);
  }, [scrollRef]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(showEvent, scrollToEnd);

    return () => subscription.remove();
  }, [scrollToEnd]);

  useEffect(() => {
    if (keyboardInset > 0) {
      scheduleScrollToEnd(scrollRef);
    }
  }, [keyboardInset, scrollRef]);

  return scrollToEnd;
}
