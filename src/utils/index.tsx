import { useRef } from 'react';
import { Dimensions, Platform } from 'react-native';
import type { RippleRef } from 'src/components/ripple';

export const normalize = (size: number) => size;
export const { width, height, scale, fontScale } = Dimensions.get('window');
export const isIos = Platform.OS === 'ios';
export const bin = (value: boolean): 0 | 1 => {
  'worklet';
  return value ? 1 : 0;
};
export interface Vector<T = number> {
  x: T;
  y: T;
}

export const useRefs = () => {
  const rippleLeft = useRef<RippleRef>(null);
  const rippleRight = useRef<RippleRef>(null);

  return {
    rippleLeft,
    rippleRight,
  };
};
