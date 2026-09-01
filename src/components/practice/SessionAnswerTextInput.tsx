import type { StyleProp, TextStyle } from 'react-native';
import { TextInput } from 'react-native';

import type { MathQuestion } from '@/features/questions/question.types';
import { isGeometryQuestion } from '@/features/questions/question.types';
import { answerInputKindForQuestion } from '@/utils/answerInputKind';
import {
  answerInputKeyboardProps,
  maxLengthForAnswerInputKind,
  sanitizeAnswerInput,
} from '@/utils/answerInputKeyboard';

type SessionAnswerTextInputProps = {
  question: MathQuestion;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  placeholder: string;
  placeholderTextColor: string;
  onSubmitEditing: () => void;
  onFocus?: () => void;
  accessibilityLabel: string;
  style: StyleProp<TextStyle>;
  lockedStyle?: StyleProp<TextStyle>;
};

export function SessionAnswerTextInput({
  question,
  value,
  onChangeText,
  editable,
  placeholder,
  placeholderTextColor,
  onSubmitEditing,
  onFocus,
  accessibilityLabel,
  style,
  lockedStyle,
}: SessionAnswerTextInputProps) {
  const kind = isGeometryQuestion(question)
    ? 'numeric'
    : answerInputKindForQuestion(question);
  const keyboard = answerInputKeyboardProps(kind);
  const maxLength = maxLengthForAnswerInputKind(kind);

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
      onSubmitEditing={onSubmitEditing}
      onFocus={onFocus}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={handleChangeText}
      maxLength={maxLength}
      style={[style, !editable && lockedStyle]}
      {...keyboard}
    />
  );
}

type SessionEquationAnswerInputProps = Omit<SessionAnswerTextInputProps, 'question'>;

export function SessionEquationAnswerInput({
  value,
  onChangeText,
  editable,
  placeholder,
  placeholderTextColor,
  onSubmitEditing,
  onFocus,
  accessibilityLabel,
  style,
  lockedStyle,
}: SessionEquationAnswerInputProps) {
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
      onSubmitEditing={onSubmitEditing}
      onFocus={onFocus}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={(text) => onChangeText(sanitizeAnswerInput(text, 'equation'))}
      maxLength={maxLengthForAnswerInputKind('equation')}
      style={[style, !editable && lockedStyle]}
      {...keyboard}
    />
  );
}
