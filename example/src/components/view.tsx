import { useTheme } from '@react-navigation/native';
import * as React from 'react';
import { View as DefaultView, ViewProps } from 'react-native';
import { palette } from '../theme/palette';

export function ThemeView(props: ViewProps) {
  const theme = useTheme();
  const { style, children, ...otherProps } = props;
  const backgroundColor = theme.dark ? palette.G8(1) : palette.W(1);
  return (
    <DefaultView style={[{ backgroundColor }, style]} {...otherProps}>
      {children}
    </DefaultView>
  );
}
