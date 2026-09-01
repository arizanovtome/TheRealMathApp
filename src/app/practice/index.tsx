import { AppScreen } from '@/components/common/AppScreen';
import { MathSessionView } from '@/components/practice/MathSessionView';

export default function PracticeScreen() {
  return (
    <AppScreen keyboardAvoiding={false}>
      <MathSessionView mode="practice" />
    </AppScreen>
  );
}
