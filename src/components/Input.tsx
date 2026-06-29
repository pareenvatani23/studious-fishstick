import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { radius, spacing } from '../theme/tokens';

/**
 * Labeled card input (board 08 + Name the Story screen). Looks like a guided
 * reflection card, not a dense form field: small accent label on top, the text
 * area below. Active card gets a teal border.
 */
interface InputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function Input({ label, value, onChangeText, placeholder, multiline = true }: InputProps) {
  const { theme, scale } = useTheme();
  const c = theme.colors;
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <View
      style={{
        backgroundColor: c.card,
        borderRadius: radius.lg,
        borderWidth: active ? Math.max(1, c.borderWidth) : c.borderWidth,
        borderColor: active ? c.teal : c.border,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 3,
      }}
    >
      <AppText size={12} weight="600" color={active ? c.teal : c.muted}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        multiline={multiline}
        allowFontScaling
        accessibilityLabel={label}
        style={{
          color: c.text1,
          fontSize: scale(15),
          marginTop: spacing.sm,
          minHeight: multiline ? scale(22) : undefined,
          textAlignVertical: 'top',
        }}
      />
    </View>
  );
}
