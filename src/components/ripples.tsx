import React, { useImperativeHandle, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { ViewStyle } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { Pressable } from 'react-native';
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
  color: string;
  rippleScale?: number;
  duration?: number;
  overflow?: boolean;
  rippleColor?: string;
  rippleOpacity?: number;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
};
type RippleType = { x: number; y: number; progress: number; unique: number };

export type RippleRefs = {
  dispatchRipple: ({ x, y }: RippleType) => void;
};
export const Ripples = React.forwardRef<RippleRefs, RippleBtnProps>(
  ({ style, color, containerStyle, overflow = false }, ref) => {
    const unique = useRef(0);
    const [ripples, setRipples] = useState<RippleType[]>([]);
    const [radius, setRadius] = useState(-1);

    useImperativeHandle(ref, () => ({
      dispatchRipple: (ripple: RippleType) => {
        setRipples(ripples.concat(ripple));
      },
    }));
    const onTouchable = ({ nativeEvent }: GestureResponderEvent) => {
      console.log(nativeEvent.pageX);

      setRipples(
        ripples.concat({
          x: nativeEvent.locationX,
          y: nativeEvent.locationY,
          unique: unique.current++,
          progress: 0,
        }),
      );
    };
    const onAnimationEnd = () => {
      setRipples(ripples.slice(1));
    };
    return (
      <TouchableWithoutFeedback onPress={onTouchable}>
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
            {ripples.map((item, i) => (
              <Ripple x={item.x} y={item.y} radius={radius} key={`${i}`} />
            ))}
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  },
);
