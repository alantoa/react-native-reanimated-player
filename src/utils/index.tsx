import { useRef } from 'react';
import { Dimensions, Platform } from 'react-native';
import type Animated from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';

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
export const useVector = (
  x1 = 0,
  y1?: number,
): Vector<Animated.SharedValue<number>> => {
  const x = useSharedValue(x1);
  const y = useSharedValue(y1 ?? x1);
  return { x, y };
};


export const useRefs = () => {
  const pan = useRef(null);
  const tap = useRef(null);
  const doubleTap = useRef(null);

  return {
    pan,
    tap,
    doubleTap
  };
};