import { AppScreen } from '@/components/common/AppScreen';
import { MathSessionView } from '@/components/practice/MathSessionView';

export default function QuizScreen() {
  return (
    <AppScreen keyboardAvoiding={false}>
      <MathSessionView mode="quiz" />
    </AppScreen>
  );
}
