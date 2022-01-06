import * as React from 'react';
import { useRef } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { ViewStyle } from 'react-native';
import { I18nManager, View, TextInput } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { SharedValue, useSharedValue } from 'react-native-reanimated';
import { Ballon, BallonRef } from './';

const {
  Value,
  event,
  cond,
  eq,
  set,
  clockRunning,
  startClock,
  spring,
  stopClock,
  Extrapolate,
  sub,
  Clock,
  divide,
  call,
  interpolateNode,
  multiply,
  block,
  or,
} = Animated;

const BUBBLE_WIDTH = 100;

type Props = {
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
  min: SharedValue<number>;
  /**
   * an AnimatedValue from `react-native-reanimated` library which is the
   * maximum value of the slider.
   */
  max: SharedValue<number>;
  /**
   * callback called when the users starts sliding
   */
  onSlidingStart: () => void;
  /**
   * callback called when the users stops sliding. the new value will be passed as
   * argument
   */
  onSlidingComplete: (n: number) => void;
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
  ballonTranslateY: number;

  /**
   * render custom thumb image.
   */
  renderThumbImage?: () => React.ReactNode;

  /**
   * thumb offset from the end of seek
   */
  thumbOffset?: number;
};

const _Slider = ({
  renderBallon,
  renderThumbImage,
  style,
  minimumTrackTintColor = '#000',
  maximumTrackTintColor = 'transparent',
  cacheTrackTintColor = '#333',
  borderColor = '#fff',
  ballonTranslateY = -25,
  thumbOffset = 7,
  progress,
  min,
  max,
  cache,
  onSlidingComplete,
  onSlidingStart,
  setBallonText,
  ballon,
}: Props) => {
  const ballonRef = useRef<BallonRef>(null);
  const _cache = useSharedValue(0);
  const gestureState = useSharedValue(0);
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const onGestureEvent = event([
    {
      nativeEvent: {
        state: gestureState.value,
        x: x.value,
      },
    },
  ]);
  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    width.value = nativeEvent.layout.width;
  };
  const convert_to_percent = (value: SharedValue<number>) => {
    return cond(
      eq(min.value, max.value),
      0,
      divide(value.value, sub(max.value, min.value)),
    );
  };

  const cache_x = multiply(convert_to_percent(cache || _cache), width.value);
  const clamped_x = cond(
    eq(width.value, 0),
    0,
    interpolateNode(x.value, {
      inputRange: [0, width.value],
      outputRange: [0, width.value],
      extrapolate: Extrapolate.CLAMP,
    }),
  );
  const value_x = divide(multiply(clamped_x, max.value), width.value);
  const progress_x = multiply(convert_to_percent(progress), width.value);

  const seek = block([
    cond(
      or(
        eq(gestureState.value, State.ACTIVE),
        eq(gestureState.value, State.BEGAN),
      ),
      [
        call([value_x], x => {
          setBallonText
            ? setBallonText(ballon ? ballon(x[0]) : x[0].toFixed())
            : ballonRef.current?.setText(
                ballon ? ballon(x[0]) : x[0].toFixed(),
              );
        }),
        cond(
          eq(gestureState.value, State.BEGAN),
          call([value_x], () => onSlidingStart?.()),
        ),
        clamped_x,
      ],
      [
        cond(
          eq(gestureState.value, State.END),
          [
            // set(gestureState.value, State.UNDETERMINED),
            call([value_x], x => onSlidingComplete?.(x[0])),
            clamped_x,
          ],
          [progress_x],
        ),
      ],
    ),
  ]);
  const thumb = sub(seek, thumbOffset);

  const _renderThumbImage = (style: ViewStyle) => {
    return <View style={style} />;
  };
  const _renderBallon = () => {
    return <Ballon ref={ballonRef} />;
  };
  const thumbRenderer = renderThumbImage || _renderThumbImage;
  const ballonRenderer = renderBallon || _renderBallon;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onGestureEvent}
      minDist={0}>
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
            style={{
              backgroundColor: cacheTrackTintColor,
              height: '100%',
              width: cache_x,
              [I18nManager.isRTL ? 'right' : 'left']: 0,
              position: 'absolute',
            }}
          />
          <Animated.View
            style={{
              backgroundColor: minimumTrackTintColor,
              height: '100%',
              maxWidth: '100%',
              width: seek,
              [I18nManager.isRTL ? 'right' : 'left']: 0,
              position: 'absolute',
            }}
          />
        </Animated.View>
        <Animated.View
          style={{
            [I18nManager.isRTL ? 'right' : 'left']: this.thumb,
            position: 'absolute',
          }}>
          {thumbRenderer({
            backgroundColor: minimumTrackTintColor,
            height: 15,
            width: 15,
            borderRadius: 30,
          })}
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            [I18nManager.isRTL ? 'right' : 'left']: -50,
            width: BUBBLE_WIDTH,
            opacity: this.height,
            transform: [
              {
                translateY: ballonTranslateY,
              },
              {
                translateX: this.clamped_x,
              },
              {
                scale: this.height,
              },
            ],
          }}>
          {ballonRenderer({ text: ballon })}
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};
