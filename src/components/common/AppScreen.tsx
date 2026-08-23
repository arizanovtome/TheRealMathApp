import type { PropsWithChildren } from 'react';
import type { ScrollViewProps } from 'react-native';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

/** Screens under a visible Stack header should not apply top inset — it can overlap the header and block the back control. */
const SAFE_AREA_EDGES_HEADER: Edge[] = ['bottom', 'left', 'right'];
const SAFE_AREA_EDGES_FULL: Edge[] = ['top', 'bottom', 'left', 'right'];

type AppScreenProps = PropsWithChildren<{
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  /** Use when the stack header is hidden (e.g. home) so content clears the status bar/notch. */
  includeTopSafeArea?: boolean;
  /** Extra offset when avoiding the keyboard (e.g. stack header height). */
  keyboardVerticalOffset?: number;
}>;

export function AppScreen({
  children,
  scroll,
  scrollProps,
  includeTopSafeArea = false,
  keyboardVerticalOffset = 0,
}: AppScreenProps) {
  const edges = includeTopSafeArea ? SAFE_AREA_EDGES_FULL : SAFE_AREA_EDGES_HEADER;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <View style={styles.wrap}>
          <View style={styles.boardFrame}>
            {scroll ? (
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                {...scrollProps}>
                {children}
              </ScrollView>
            ) : (
              <View style={styles.fill}>{children}</View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const FRAME = 10;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  boardFrame: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: FRAME,
    borderColor: colors.frame,
    backgroundColor: colors.board,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  fill: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    flexGrow: 1,
  },
});
