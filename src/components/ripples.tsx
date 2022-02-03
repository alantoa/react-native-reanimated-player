import React, { useImperativeHandle, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { hexToRgbA } from '../utils/hexToRgba';
import { Ripple } from './ripple';
type ValueOf<T> = T[keyof T];

type RippleBtnProps = {
  children: React.ReactElement;
  color: string;
  onPress?: () => void;
  rippleScale?: number;
  duration?: number;
  overflow?: boolean;
  rippleColor?: string;
  rippleOpacity?: number;
  containerStyle?: ViewStyle;
  style: ViewStyle;
};
export type RippleRefs = {
  disparchRipple: ({ x, y }: { x: number; y: number }) => void;
};
export const Ripples = React.forwardRef<RippleRefs, RippleBtnProps>(
  ({ style, color, containerStyle, overflow = false }, ref) => {
    const [ripples, setRipples] = useState([{ x: 0, y: 0 }]);
    const [radius, setRadius] = useState(-1);

    return (
      <Animated.View style={style}>
        <View
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              backgroundColor: color,
              overflow: !overflow ? 'hidden' : undefined,
            },
            containerStyle,
          ]}
          onLayout={({
            nativeEvent: {
              layout: { width, height },
            },
          }) => {
            setRadius(Math.sqrt(width ** 2 + height ** 2));
          }}>
          {ripples.map(item => (
            <Ripple x={item.x} y={item.y} />
          ))}
        </View>
      </Animated.View>
    );
  },
);
