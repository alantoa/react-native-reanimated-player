import React, { useImperativeHandle, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
export type RippleTargetEvent = { x: number; y: number };

type RippleBtnProps = {
  children: React.ReactElement;
  duration?: number;
  overflow?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  onAnimationEnd?: () => void;
  style?: StyleProp<ViewStyle>;
};
export type RippleRef = {
  onPress: ({ x, y }: RippleTargetEvent) => void;
};
const _Ripple = React.forwardRef<RippleRef, RippleBtnProps>(
  (
    {
      children,
      containerStyle,
      duration = 600,
      backgroundColor = 'rgba(255,255,255,.3)',
      onAnimationEnd,
      overflow,
      style,
    },
    ref,
  ) => {
    const scale = useSharedValue(0);
    const centerX = useSharedValue(0);
    const centerY = useSharedValue(0);
    const isFinished = useSharedValue(false);
    const rippleOpacity = useSharedValue(1);
    const [radius, setRadius] = useState(-1);

    const rStyle = useAnimatedStyle(() => {
      const translateX = centerX.value - radius;
      const translateY = centerY.value - radius;

      return {
        opacity: rippleOpacity.value,

        transform: [
          { translateX },
          { translateY },
          {
            scale: scale.value,
          },
        ],
      };
    }, [radius]);
    useImperativeHandle(ref, () => ({
      onPress: ({ x, y }) => {
        'worklet';

        centerX.value = x;
        centerY.value = y;

        rippleOpacity.value = 1;
        scale.value = 0;
        scale.value = withTiming(1, { duration }, finised => {
          if (finised) {
            isFinished.value = true;
            scale.value = withTiming(0, { duration: 0 });
            if (onAnimationEnd) {
              runOnJS(onAnimationEnd)();
            }
          }
        });
      },
    }));

    return (
      <View
        onLayout={({
          nativeEvent: {
            layout: { width, height },
          },
        }) => {
          setRadius(Math.sqrt(width ** 2 + height ** 2));
        }}
        style={[style]}
        pointerEvents="none">
        {radius > -1 && (
          <Animated.View
            style={[
              style,
              containerStyle,
              { overflow: !overflow ? 'hidden' : 'visible' },
            ]}>
            {children}
            <Animated.View
              style={[
                {
                  backgroundColor,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: radius * 2,
                  height: radius * 2,
                  borderRadius: radius,
                  zIndex: 1121,
                },
                rStyle,
              ]}
            />
          </Animated.View>
        )}
      </View>
    );
  },
);
export const Ripple = React.memo(_Ripple);
