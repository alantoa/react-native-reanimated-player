import React, { useState, useRef } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { ViewStyle } from 'react-native';
import { I18nManager, View, TextInput } from 'react-native';
import { PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { GestureEvent } from 'react-native-gesture-handler';
import { TapGestureHandlerEventPayload } from 'react-native-gesture-handler';
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithTimingConfig,
} from 'react-native-reanimated';
import { runOnJS, sub } from 'react-native-reanimated';
import { clamp } from 'react-native-redash';
import { palette } from '../theme/palette';
import { Ballon, BallonRef } from './';

export type AwesomeSliderProps = {
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
   * callback called when slide value change
   * @reture max/min
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
   * render custom thumb image. if you need to customize thumb,
   * you also need to set the `thumb width`
   */
  renderThumbImage?: () => React.ReactNode;

  /**
   * thumb elements width, default 15
   */
  thumbWidth?: number;

  /**
   * disable slide
   */
  disable?: boolean;

  /**
   * enable tap event change value, default true
   */
  disableTapEvent?: boolean;

  /**
   * bubble elements width, default is recommended,
   * unless you have very long text to display.
   */
  bubbleWidth?: number;
  /**
   * with progress sliding timingConfig
   */
  timingConfig?: WithTimingConfig;
};
const defaultTimingConfig: WithTimingConfig = {
  duration: 300,
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
  disableTapEvent = false,
  ballon,
  bubbleWidth = 100,
  timingConfig = defaultTimingConfig,
}: AwesomeSliderProps) => {
  const ballonRef = useRef<BallonRef>(null);
  /**
   *  current progress convert to animated value.
   * @returns number
   */

  const width = useSharedValue(0);
  const seekValue = useSharedValue(0);
  const thumbValue = useSharedValue(0);
  const ballonOpacity = useSharedValue(0);
  const cacheXValue = useSharedValue(0);
  const isScrubbing = useSharedValue(false);

  const animatedSeekStyle = useAnimatedStyle(() => {
    const currentValue =
      (progress.value / (minimumValue.value + maximumValue.value)) *
      width.value;

    return {
      width: withTiming(
        clamp(currentValue, 0, width.value - thumbWidth),
        isScrubbing.value
          ? {
              duration: 0,
            }
          : timingConfig,
      ),
    };
  }, [progress.value, isScrubbing.value]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    const currentValue =
      (progress.value / (minimumValue.value + maximumValue.value)) *
      width.value;

    return {
      transform: [
        {
          translateX: withTiming(
            clamp(currentValue, 0, width.value - thumbWidth),
            isScrubbing.value
              ? {
                  duration: 0,
                }
              : timingConfig,
          ),
        },
      ],
    };
  }, [progress.value, isScrubbing.value]);

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

  const onSlideAcitve = (second: number) => {
    const formatSecond = `${Math.round(second * 100) / 100}`;
    const ballonText = ballon ? ballon?.(second) : formatSecond;
    onValueChange?.(second);
    setBallonText
      ? setBallonText(ballonText)
      : ballonRef.current?.setText(ballonText);
  };

  /**
   * convert Sharevalue to seconds
   * @returns number
   */
  const shareValueToSeconds = () => {
    'worklet';
    return ((thumbValue.value + thumbWidth) / width.value) * maximumValue.value;
  };
  /**
   * convert [x] position to progress
   * @returns number
   */
  const xToProgress = (x: number) => {
    'worklet';
    return clamp(
      Math.round((x / width.value) * maximumValue.value),
      minimumValue.value,
      maximumValue.value,
    );
  };
  /**
   * change slide value
   */
  const onActiveSlider = (x: number) => {
    'worklet';
    isScrubbing.value = true;
    thumbValue.value = clamp(x, 0, width.value - thumbWidth);
    seekValue.value = clamp(x, 0, width.value - thumbWidth);
    const currentValue = xToProgress(x);
    progress.value = clamp(
      currentValue,
      minimumValue.value,
      maximumValue.value,
    );
    runOnJS(onSlideAcitve)(shareValueToSeconds());
  };

  const onGestureEvent = useAnimatedGestureHandler<
    GestureEvent<PanGestureHandlerEventPayload>
  >({
    onStart: () => {
      if (disable) return;

      ballonOpacity.value = withSpring(1);
      isScrubbing.value = true;
      if (onSlidingStart) {
        runOnJS(onSlidingStart)();
      }
    },
    onActive: ({ x }) => {
      if (disable) return;
      onActiveSlider(x);
    },

    onEnd: ({ x }) => {
      if (disable) return;
      ballonOpacity.value = withSpring(0);
      isScrubbing.value = false;
      if (onSlidingComplete) {
        runOnJS(onSlidingComplete)(shareValueToSeconds());
      }
    },
  });

  const onSingleTapEvent = useAnimatedGestureHandler<
    GestureEvent<TapGestureHandlerEventPayload>
  >({
    onActive: ({ x }) => {
      if (disable || disableTapEvent) return;
      onActiveSlider(x);
    },
    onEnd: ({ x }) => {
      if (disable || disableTapEvent) return;

      ballonOpacity.value = withSpring(0);
      isScrubbing.value = true;
      if (onSlidingComplete) {
        runOnJS(onSlidingComplete)(shareValueToSeconds());
      }
    },
  });

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    width.value = nativeEvent.layout.width;
    const currentValue =
      (progress.value / (minimumValue.value + maximumValue.value)) *
      nativeEvent.layout.width;

    thumbValue.value = seekValue.value = clamp(
      currentValue,
      0,
      nativeEvent.layout.width - thumbWidth,
    );
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} minDist={0}>
      <Animated.View>
        <TapGestureHandler onGestureEvent={onSingleTapEvent}>
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
              {renderThumbImage ? (
                renderThumbImage()
              ) : (
                <View
                  style={{
                    backgroundColor: minimumTrackTintColor,
                    height: thumbWidth,
                    width: thumbWidth,
                    borderRadius: thumbWidth,
                  }}
                />
              )}
            </Animated.View>

            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: -bubbleWidth / 2,
                  width: bubbleWidth,
                },
                animatedBubbleStyle,
              ]}>
              {renderBallon ? renderBallon() : <Ballon ref={ballonRef} />}
            </Animated.View>
          </Animated.View>
        </TapGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};
