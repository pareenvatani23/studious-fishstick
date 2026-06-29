import React from 'react';
import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * Themed Text. Applies the in-app text-size step via scale() AND keeps OS
 * Dynamic Type on (allowFontScaling) so both accessibility paths work. Default
 * colour is the theme's primary text; pass `color` for anything else.
 */
type Weight = '400' | '500' | '600' | '700';

interface AppTextProps extends TextProps {
  size?: number;
  weight?: Weight;
  color?: string;
  align?: TextStyle['textAlign'];
  letterSpacing?: number;
  lineHeightMultiple?: number;
  uppercase?: boolean;
  style?: StyleProp<TextStyle>;
}

export function AppText({
  size = 16,
  weight = '400',
  color,
  align,
  letterSpacing,
  lineHeightMultiple = 1.3,
  uppercase,
  style,
  children,
  ...rest
}: AppTextProps) {
  const { theme, scale } = useTheme();
  const fontSize = scale(size);
  return (
    <Text
      allowFontScaling
      style={[
        {
          color: color ?? theme.colors.text1,
          fontSize,
          fontWeight: weight,
          textAlign: align,
          letterSpacing,
          lineHeight: Math.round(fontSize * lineHeightMultiple),
        },
        uppercase && { textTransform: 'uppercase' as const },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
