import React, { useState, useRef } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { ViewStyle } from 'react-native';
import { I18nManager, View, TextInput } from 'react-native';
import { PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { GestureEvent } from 'react-native-gesture-handler';
import { TapGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS, sub } from 'react-native-reanimated';
import { clamp } from 'react-native-redash';
import { palette } from '../theme/palette';
import { Ballon, BallonRef } from './';

const BUBBLE_WIDTH = 100;

type SliderProps = {
  /**
   * color to fill the progress in the seekbar
   */
  minimumTrackTintColor?: string;

  /**
   * color to fill the background in the seekbar
   */
  maximumTrackTintColor?: string;

  /**
   * color to fill the cache in the seekbar
   */
  cacheTrackTintColor?: string;
  /**
   * style for the container view
   */
  style?: any;
  /**
   * color of the border of the slider
   */
  borderColor?: string;
  /**
   * a function that gets the current value of the slider as you slide it,
   * and returns a string to be used inside the ballon. if not provided it will use the
   * current value as integer.
   */
  ballon?: (s: number) => string;

  /**
   * an AnimatedValue from `react-native-reanimated` library which is the
   * current value of the slider.
   */
  progress: SharedValue<number>;
  /**
   * an AnimatedValue from `react-native-reanimated` library which is the
   * curren value of the cache. the cache is optional and will be rendered behind
   * the main progress indicator.
   */
  cache?: SharedValue<number>;
  /**
   * an AnimatedValue from `react-native-reanimated` library which is the
   * minimum value of the slider.
   */
  minimumValue: SharedValue<number>;
  /**
   * an AnimatedValue from `react-native-reanimated` library which is the
   * maximum value of the slider.
   */
  maximumValue: SharedValue<number>;
  /**
   * callback called when the users starts sliding
   */
  onSlidingStart: () => void;
  /**
   * callback called when the users starts sliding
   */
  onValueChange?: (second: number) => void;
  /**
   * callback called when the users stops sliding. the new value will be passed as
   * argument
   */
  onSlidingComplete: (second: number) => void;
  /**
   * render custom Ballon to show when sliding.
   */
  renderBallon?: () => React.ReactNode;
  /**
   * this function will be called while sliding, and should set the text inside your custom
   * ballon.
   */
  setBallonText?: (s: string) => void;

  /**
   * value to pass to the container of the ballon as `translateY`
   */
  ballonTranslateY?: number;

  /**
   * render custom thumb image.
   */
  renderThumbImage?: () => React.ReactNode;

  /**
   * thumb offset from the end of seek
   */
  thumbOffset?: number;

  thumbWidth?: number;
  disable?: boolean;
};

export const Slider = ({
  renderBallon,
  renderThumbImage,
  style,
  minimumTrackTintColor = palette.Main(1),
  maximumTrackTintColor = palette.G3(1),
  cacheTrackTintColor = palette.G6(1),
  borderColor = palette.transparent,
  ballonTranslateY = -25,
  thumbOffset = 7,
  progress,
  minimumValue,
  maximumValue,
  cache,
  onSlidingComplete,
  onSlidingStart,
  setBallonText,
  onValueChange,
  thumbWidth = 15,
  disable,
  ballon,
}: SliderProps) => {
  const ballonRef = useRef<BallonRef>(null);
  const width = useSharedValue(0);
  const seekValue = useSharedValue(0);
  const thumbValue = useSharedValue(0);
  const ballonOpacity = useSharedValue(0);
  const cacheXValue = useSharedValue(0);

  const animatedSeekStyle = useAnimatedStyle(() => {
    return {
      width: seekValue.value,
    };
  });
  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      // [I18nManager.isRTL ? 'right' : 'left']: thumbValue.value,
      transform: [
        {
          translateX: thumbValue.value,
        },
      ],
    };
  });
  const animatedBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: ballonOpacity.value,
      transform: [
        {
          translateY: ballonTranslateY,
        },
        {
          translateX: thumbValue.value + thumbWidth / 2,
        },
        {
          scale: ballonOpacity.value,
        },
      ],
    };
  });
  const animatedCacheXStyle = useAnimatedStyle(() => {
    return {
      width: cacheXValue.value,
    };
  });
  /**
   * convert Sharevalue to seconds
   * @returns seconds
   */
  const shareValueToSeconds = () => {
    'worklet';
    return ((thumbValue.value + thumbWidth) / width.value) * maximumValue.value;
  };
  /**
   * convert  seconds  to Sharevalue
   * @returns ShareValue<number>['value']
   */
  const secondsToshareValue = (seconds: number) => {
    'worklet';
    return seconds;
  };

  const onSlideAcitve = (second: number) => {
    ballonRef.current?.setText(`${Math.round(second).toString()}`);
    onValueChange?.(second);
  };
  const onGestureEvent = useAnimatedGestureHandler<
    GestureEvent<PanGestureHandlerEventPayload>
  >({
    onStart: () => {
      if (disable) return;
      if (onSlidingStart) {
        runOnJS(onSlidingStart)();
      }
      ballonOpacity.value = withSpring(1);
    },
    onActive: ({ x }) => {
      if (disable) return;
      runOnJS(onSlideAcitve)(shareValueToSeconds());
      thumbValue.value = clamp(x, 0, width.value - thumbWidth);
      seekValue.value = clamp(x, 0, width.value - thumbWidth);
    },

    onEnd: () => {
      if (disable) return;
      if (onSlidingComplete) {
        runOnJS(onSlidingComplete)(shareValueToSeconds());
      }
      ballonOpacity.value = withSpring(0);
    },
  });

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    width.value = nativeEvent.layout.width;
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} minDist={0}>
      <Animated.View
        style={[
          {
            flex: 1,
            height: 30,
            overflow: 'visible',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3330',
          },
          style,
        ]}
        onLayout={onLayout}>
        <Animated.View
          style={{
            width: '100%',
            height: 5,
            borderRadius: 2,
            borderColor: borderColor,
            overflow: 'hidden',
            borderWidth: 1,
            backgroundColor: maximumTrackTintColor,
          }}>
          <Animated.View
            style={[
              {
                backgroundColor: cacheTrackTintColor,
                height: '100%',
                left: 0,
                position: 'absolute',
              },
              animatedCacheXStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                backgroundColor: minimumTrackTintColor,
                height: '100%',
                maxWidth: '100%',
                left: 0,
                position: 'absolute',
              },
              animatedSeekStyle,
            ]}
          />
        </Animated.View>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
            },
            animatedThumbStyle,
          ]}>
          <View
            style={{
              backgroundColor: minimumTrackTintColor,
              height: thumbWidth,
              width: thumbWidth,
              borderRadius: thumbWidth,
            }}
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              left: -BUBBLE_WIDTH / 2,
              width: BUBBLE_WIDTH,
            },
            animatedBubbleStyle,
          ]}>
          <Ballon ref={ballonRef} />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};
