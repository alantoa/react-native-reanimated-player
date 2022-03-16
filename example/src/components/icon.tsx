import React from 'react';
import type { StyleProp } from 'react-native';
import type { ViewProps } from 'react-native';
import type { ViewStyle } from 'react-native';
import { normalize } from '../../../src/utils';
import type { IconNames } from './iconfont';
import IconFont from './iconfont';

export type IconProps = {
  name: IconNames;
  size?: number;
  color?: string | string[];
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
} & ViewProps;
export const Icon = ({ color, size, ...rest }: IconProps) => (
  <IconFont
    {...rest}
    {...(size ? { size: normalize(size) } : {})}
    color={color || ''}
  />
);
