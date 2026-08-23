import type { RefObject } from 'react';
import type { ScrollView, StyleProp, TextInputProps, TextStyle } from 'react-native';
import { TextInput } from 'react-native';

import type { MathQuestion } from '@/features/questions/question.types';
import { isGeometryQuestion } from '@/features/questions/question.types';
import { answerInputKindForQuestion } from '@/utils/answerInputKind';
import {
  answerInputKeyboardProps,
  sanitizeAnswerInput,
} from '@/utils/answerInputKeyboard';
import { useScrollToFocusedInput } from '@/utils/keyboardScroll';

type SessionAnswerTextInputProps = {
  question: MathQuestion;
  scrollRef: RefObject<ScrollView | null>;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  placeholder: string;
  placeholderTextColor: string;
  onSubmitEditing: () => void;
  accessibilityLabel: string;
  style: StyleProp<TextStyle>;
  lockedStyle?: StyleProp<TextStyle>;
};

export function SessionAnswerTextInput({
  question,
  scrollRef,
  value,
  onChangeText,
  editable,
  placeholder,
  placeholderTextColor,
  onSubmitEditing,
  accessibilityLabel,
  style,
  lockedStyle,
}: SessionAnswerTextInputProps) {
  const scrollToInput = useScrollToFocusedInput(scrollRef);
  const kind = isGeometryQuestion(question)
    ? 'numeric'
    : answerInputKindForQuestion(question);
  const keyboard = answerInputKeyboardProps(kind);

  const handleChangeText = (text: string) => {
    onChangeText(sanitizeAnswerInput(text, kind));
  };

  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      editable={editable}
      returnKeyType="done"
      textContentType="none"
      autoCorrect={false}
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      importantForAutofill="no"
      onFocus={scrollToInput}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={handleChangeText}
      style={[style, !editable && lockedStyle]}
      {...keyboard}
    />
  );
}

type SessionEquationAnswerInputProps = Omit<SessionAnswerTextInputProps, 'question'>;

export function SessionEquationAnswerInput({
  scrollRef,
  value,
  onChangeText,
  editable,
  placeholder,
  placeholderTextColor,
  onSubmitEditing,
  accessibilityLabel,
  style,
  lockedStyle,
}: SessionEquationAnswerInputProps) {
  const scrollToInput = useScrollToFocusedInput(scrollRef);
  const keyboard = answerInputKeyboardProps('equation');

  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      editable={editable}
      returnKeyType="done"
      textContentType="none"
      autoCorrect={false}
      autoComplete="off"
      importantForAutofill="no"
      onFocus={scrollToInput}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={onChangeText}
      style={[style, !editable && lockedStyle]}
      {...keyboard}
    />
  );
}
