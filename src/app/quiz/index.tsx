import { AppScreen } from '@/components/common/AppScreen';
import { MathSessionView } from '@/components/practice/MathSessionView';

export default function QuizScreen() {
  return (
    <AppScreen>
      <MathSessionView mode="quiz" />
    </AppScreen>
  );
}
