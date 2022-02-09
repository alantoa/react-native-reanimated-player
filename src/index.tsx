import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Slider } from 'react-native-awesome-slider/src/index';
import {
  GestureEvent,
  TapGestureHandler,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Orientation, { OrientationType } from 'react-native-orientation-locker';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';
import Video, {
  OnLoadData,
  OnProgressData,
  OnSeekData,
  VideoProperties,
} from 'react-native-video';
import { VideoLoader } from './video-loading';
import { secondToTime, formatTimeToMins, formatTime } from './video-utils';
import { bin, isIos, useRefs, useVector } from './utils';
import { Dimensions } from 'react-native';
import { palette } from './theme/palette';
import { Text } from './components';
import { Image } from 'react-native';
import { TapControler } from './tap-controler';
import type { TapGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { Ripple } from './components/ripple';
import { clamp } from 'react-native-awesome-slider/src/utils';
export const { width, height, scale, fontScale } = Dimensions.get('window');

const VIDEO_DEFAULT_HEIGHT = width * (9 / 16);
const hitSlop = { left: 8, bottom: 8, right: 8, top: 8 };

const controlAnimteConfig = {
  duration: 200,
};

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

interface IProps extends VideoProperties {
  showOnStart?: boolean;
  showTimeRemaining?: boolean;
  showHours?: boolean;
  disableTimer?: boolean;
  disableSeekbar?: boolean;
  disablePlayPause?: boolean;
  toggleResizeModeOnFullscreen?: boolean;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  controlTimeout?: number;
  videoDefaultHeight?: number;
  videoDefaultWidth?: number;
  headerTitle?: string;
  onTapBack?: () => void;
  navigation?: any;
  initPaused?: boolean;
  autoPlay?: boolean;
  onToggleAutoPlay?: (state: boolean) => void;
  onTapMore?: () => void;
  doubleTapInterval?: number;
}

const VideoPlayer: React.FC<IProps> = ({
  resizeMode = 'contain',
  showOnStart = true,
  muted = false,
  volume = 1,
  rate = 1,
  showHours = false,
  source,
  disableTimer,
  disableSeekbar = false,
  disablePlayPause = false,
  style,
  toggleResizeModeOnFullscreen = true,
  onEnterFullscreen,
  onExitFullscreen,
  controlTimeout = 2000,
  videoDefaultHeight = VIDEO_DEFAULT_HEIGHT,
  videoDefaultWidth = width,
  headerTitle = '',
  onTapBack,
  navigation,
  initPaused = false,
  autoPlay = false,
  onToggleAutoPlay,
  onTapMore,
  doubleTapInterval = 500,
  ...rest
}) => {
  /**
   * hooks
   */
  const insets = useSafeAreaInsets();
  const insetsRef = useRef(insets);
  const dimensions = useWindowDimensions();

  const leftDoubleTapBoundary =
    dimensions.width / 2 - insets.left - insets.right - 80;

  const rightDoubleTapBoundary =
    dimensions.width - leftDoubleTapBoundary - insets.left - insets.right;
  /**
   * state
   */
  const [paused, setPaused] = useState(initPaused);
  const [state, setState] = useState({
    // Video
    resizeMode: resizeMode,
    muted: muted,
    volume: volume,
    rate: rate,
    // Controls
    showHours: showHours,
    error: false,
    showRemainingTime: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setIsLoading] = useState(false);
  const [showTimeRemaining, setShowTimeRemaining] = useState(true);
  const [allowAutoPlayVideo, setAllowAutoPlayVideo] = useState(autoPlay);
  /**
   * refs
   */
  const player = useRef({
    duration: 0,
  });
  const videoPlayer = useRef<Video>(null);
  const mounted = useRef(false);
  const autoPlayAnimation = useSharedValue(autoPlay ? 1 : 0);
  const { tap, doubleTap, pan, rippleLeft, rippleRight } = useRefs();
  /**
   * reanimated value
   */
  const fullScreen = useSharedValue(false);
  const isLoadEnd = useSharedValue(false);

  const backdropOpacity = useSharedValue(0);
  const controlViewOpacity = useSharedValue(showOnStart ? 1 : 0);
  const autoPlayTextAnimation = useSharedValue(0);
  const doubleLeftOpacity = useSharedValue(0);
  const doubleRightOpacity = useSharedValue(0);
  const playAnimated = useSharedValue(0);
  const videoContainerInfo = useVector(videoDefaultWidth, videoDefaultHeight);
  const videoScale = useSharedValue(1);
  const videoTransY = useSharedValue(0);

  const max = useSharedValue(100);
  const min = useSharedValue(0);
  const isScrubbing = useSharedValue(false);
  const isSeeking = useRef(false);
  const progress = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    return {
      height: videoContainerInfo.y.value,
    };
  }, []);
  const videoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: videoScale.value,
        },
        {
          translateY: videoTransY.value,
        },
      ],
    };
  }, []);

  const bottomControlStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: fullScreen.value ? -42 : 0,
        },
      ],
    };
  });
  const topControlStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: fullScreen.value ? -42 : 0,
        },
      ],
      opacity: withTiming(bin(!fullScreen.value)),
    };
  });
  const topFullscreenControlStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(bin(fullScreen.value)),
    };
  });

  const bottomSliderStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(bin(!fullScreen.value)),
      top: videoContainerInfo.y.value + insets.top,
    };
  });
  const fullScreenSliderStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(bin(fullScreen.value)),
    };
  });
  const controlViewStyles = useAnimatedStyle(() => {
    return {
      opacity: controlViewOpacity.value,
    };
  });
  const backdropStyles = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });
  const autoPlayTextStyle = useAnimatedStyle(() => {
    return {
      opacity: autoPlayTextAnimation.value,
    };
  });

  const getDoubleLeftStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(doubleLeftOpacity.value),
    };
  });

  const getDoubleRightStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(doubleRightOpacity.value),
    };
  });
  /**
   * useAnimatedProps
   */
  const playAnimatedProps = useAnimatedProps(() => {
    return {
      progress: withTiming(playAnimated.value),
    };
  });
  const fullscreenAnimatedProps = useAnimatedProps(() => {
    return {
      progress: withTiming(fullScreen.value ? 0.5 : 0),
    };
  });
  const autoPlayAnimatedProps = useAnimatedProps(() => {
    return {
      progress: withTiming(autoPlayAnimation.value, { duration: 600 }),
    };
  });
  /**
   * useEffect
   */
  useEffect(() => {
    mounted.current = true;
    Orientation.lockToPortrait();
    initPaused ? pause() : play();
    const unBeforeRemove = navigation?.addListener('beforeRemove', (e: any) => {
      e?.preventDefault();
      if (fullScreen.value) {
        toggleFullScreen();
      } else {
        navigation.dispatch(e.data.action);
      }
    });
    return () => {
      mounted.current = false;
      clearControlTimeout();
      pause();
      Orientation.lockToPortrait();
      unBeforeRemove && unBeforeRemove();
    };
  }, []);

  /**
   * Set a timeout when the controls are shown
   * that hides them after a length of time.
   */
  const setControlTimeout = () => {
    'worklet';
    controlViewOpacity.value = withDelay(
      controlTimeout,
      withTiming(0, controlAnimteConfig),
    );
  };

  /**
   * Clear the hide controls timeout.
   */
  const clearControlTimeout = () => {
    'worklet';
    cancelAnimation(controlViewOpacity);
    controlViewOpacity.value = withTiming(1);
  };

  /**
   * Reset the timer completely
   */
  const resetControlTimeout = () => {
    'worklet';
    clearControlTimeout();
    setControlTimeout();
  };

  /**
   * Animation to show controls...opposite of
   * above...move onto the screen and then
   * fade in.
   */
  const showControlAnimation = () => {
    'worklet';
    controlViewOpacity.value = withTiming(1, controlAnimteConfig);
  };

  const togglePlayPause = () => {
    if (isLoadEnd.value) {
      onReplyVideo();
      isLoadEnd.value = false;
    }
    resetControlTimeout();
    paused ? play() : pause();
  };
  const seekByStep = (isBack = false) => {
    seekTo(currentTime - (isBack ? 10 : -10));
  };

  /**
   * Toggle player full screen state on <Video> component
   */
  const toggleFullScreen = () => {
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
      return;
    }
    resetControlTimeout();

    Orientation.getOrientation(orientation => {
      if (fullScreen.value && orientation !== OrientationType.PORTRAIT) {
        backdropOpacity.value = 0;
        fullScreen.value = false;
        StatusBar.setHidden(false, 'fade');
        Orientation.lockToPortrait();
        videoContainerInfo.x.value = videoDefaultWidth;
        videoContainerInfo.y.value = videoDefaultHeight;
        onExitFullscreen?.();
      } else {
        backdropOpacity.value = 1;
        fullScreen.value = true;
        StatusBar.setHidden(true, 'fade');
        Orientation.lockToLandscape();
        videoContainerInfo.x.value = height;
        videoContainerInfo.y.value = width;
        onEnterFullscreen?.();
      }
    });

    setState({
      ...state,
      resizeMode: toggleResizeModeOnFullscreen
        ? !isFullscreen
          ? 'cover'
          : 'contain'
        : resizeMode,
    });

    setIsFullscreen(!isFullscreen);
  };
  /**
   * onPanGesture
   */
  const onPanGesture = useAnimatedGestureHandler<
    GestureEvent<PanGestureHandlerEventPayload>
  >({
    onStart: ({ translationY }) => {
      controlViewOpacity.value = withTiming(0, controlAnimteConfig);
    },
    onActive: ({ translationY }) => {
      if (fullScreen.value) {
        if (translationY > 0) {
          if (Math.abs(translationY) < 100) {
            videoScale.value = clamp(
              0.9,
              1 - Math.abs(translationY) * 0.008,
              1,
            );
            videoTransY.value = translationY;
          }
        }
      } else {
        if (translationY < 0) {
          if (Math.abs(translationY) < 44) {
            videoScale.value = Math.abs(translationY) * 0.012 + 1;
          }
        }
      }
    },
    onEnd: ({ translationY }) => {
      if (fullScreen.value) {
        if (Math.abs(translationY) >= 100) {
          runOnJS(toggleFullScreen)();
        }
      } else {
        if (Math.abs(translationY) >= 44) {
          runOnJS(toggleFullScreen)();
        }
      }
      videoTransY.value = 0;
      videoScale.value = withTiming(1);
    },
  });
  const singleTapHandler = useAnimatedGestureHandler<
    GestureEvent<TapGestureHandlerEventPayload>
  >({
    onActive: () => {
      if (controlViewOpacity.value === 0) {
        controlViewOpacity.value = withTiming(1, controlAnimteConfig);
        setControlTimeout();
      } else {
        controlViewOpacity.value = withTiming(0, controlAnimteConfig);
      }
    },
  });

  const doubleTapHandler = useAnimatedGestureHandler<
    GestureEvent<TapGestureHandlerEventPayload>,
    {
      isAlive: boolean;
    }
  >({
    onStart: ({ x }, ctx) => {
      if (x > leftDoubleTapBoundary && x < rightDoubleTapBoundary) {
        ctx.isAlive = false;
        return;
      } else {
        ctx.isAlive = true;
      }
    },
    onActive: ({ x, y, numberOfPointers }, ctx) => {
      if (numberOfPointers !== 1) return;
      if (!ctx.isAlive) {
        resetControlTimeout();
        if (controlViewOpacity.value === 0) {
          showControlAnimation();
          return;
        }
      }

      if (x < leftDoubleTapBoundary) {
        doubleLeftOpacity.value = 1;
        rippleLeft.current?.onPress({ x, y });
        runOnJS(seekByStep)(true);
        return;
      }

      if (x > rightDoubleTapBoundary) {
        doubleRightOpacity.value = 1;
        rippleRight.current?.onPress({
          x: x - rightDoubleTapBoundary,
          y,
        });
        runOnJS(seekByStep)(false);

        return;
      }
    },
  });

  const onPauseTapHandler = () => {
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
      return;
    }
    togglePlayPause();
  };
  const onBackTapHandler = () => {
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
      return;
    }
    if (fullScreen.value) {
      toggleFullScreen();
    } else {
      onTapBack?.();
    }
  };

  /**
   * When load starts we display a loading icon
   * and show the controls.
   */
  const onLoadStart = () => {
    setIsLoading(true);
  };

  /**
   * Toggle between showing time remaining or
   * video duration in the timer control
   */
  const toggleTimer = () => {
    resetControlTimeout();
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
      return;
    }
    setShowTimeRemaining(!showTimeRemaining);
  };
  const onTapSlider = () => {
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
    }
  };
  /**
   * Calculate the time to show in the timer area
   * based on if they want to see time remaining
   * or duration. Formatted to look as 00:00.
   */
  const calculateTime = () => {
    return showTimeRemaining
      ? `${formatTimeToMins(currentTime)}`
      : `-${formatTime({
          time: player.current.duration - currentTime,
          duration: player.current.duration,
        })}`;
  };
  /**
   * Seek to a time in the video.
   *
   * @param {float} time time to seek to in ms
   */
  const seekTo = (time = 0) => {
    setCurrentTime(time);
    videoPlayer.current?.seek(time);
  };
  const onLoad = (data: OnLoadData) => {
    player.current.duration = data?.duration;
    max.value = data?.duration;
    setIsLoading(false);
    setControlTimeout();
  };
  const onEnd = () => {
    isLoadEnd.value = true;
    pause();
  };
  /**
   * For onSeek we clear scrubbing if set.
   *
   * @param {object} data The video meta data
   */
  const onSeek = (data: OnSeekData) => {
    if (isScrubbing.value) {
      // Seeking may be false here if the user released the seek bar while the player was still processing
      // the last seek command. In this case, perform the steps that have been postponed.
      if (!isSeeking.current) {
        setControlTimeout();
        pause();
      }
      isSeeking.current = false;
      isScrubbing.value = false;

      setCurrentTime(data.currentTime);
    } else {
      isSeeking.current = false;
    }
  };

  /**
   * For onprogress we fire listeners that
   * update our seekbar and timer.
   *
   * @param {object} data The video meta data
   */
  const onProgress = ({ currentTime }: OnProgressData) => {
    if (!isScrubbing.value) {
      if (!isSeeking.current) {
        progress.value = currentTime;
      }
      setCurrentTime(currentTime);
    }
  };
  /**
   * on replay video
   */
  const onReplyVideo = () => {
    seekTo(0);
    setCurrentTime(0);
    progress.value = 0;
  };

  /**
   * play the video
   */
  const play = () => {
    setPaused(false);
    playAnimated.value = 0;
  };

  /**
   * pause the video
   */
  const pause = () => {
    setPaused(true);
    playAnimated.value = 0.5;
  };
  const toggleAutoPlay = () => {
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
      return;
    }
    resetControlTimeout();
    autoPlayAnimation.value = autoPlayAnimation.value === 0 ? 0.5 : 0;
    autoPlayTextAnimation.value = withTiming(1);
    autoPlayTextAnimation.value = withDelay(3000, withTiming(0));

    setAllowAutoPlayVideo(!allowAutoPlayVideo);
    onToggleAutoPlay?.(!allowAutoPlayVideo);
  };

  const onMoreTapHandler = () => {
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
      return;
    }
    resetControlTimeout();
    onTapMore?.();
  };

  /**
   * Render the seekbar and attach its handlers
   */
  const onSlidingComplete = (val: number) => {
    isSeeking.current = true;
    seekTo(val);
  };
  const onSlidingStart = () => {
    clearControlTimeout();
  };

  return (
    <>
      <PanGestureHandler ref={pan} onGestureEvent={onPanGesture}>
        <Animated.View
          style={{
            alignItems: 'center',
            backgroundColor: palette.B(1),
            elevation: 10,
            justifyContent: 'center',
            zIndex: 10,
            paddingTop: insets.top,
            overflow: 'hidden',
          }}>
          <Animated.View style={[styles.viewContainer]}>
            <Animated.View style={[containerStyle, videoStyle]}>
              <Video
                {...rest}
                ref={videoPlayer}
                resizeMode={state.resizeMode}
                volume={state.volume}
                paused={paused}
                muted={state.muted}
                rate={state.rate}
                onLoadStart={onLoadStart}
                style={[styles.video, style]}
                source={source}
                onLoad={onLoad}
                onSeek={onSeek}
                onEnd={onEnd}
                onProgress={onProgress}
                fullscreenAutorotate={true}
              />
            </Animated.View>
            <VideoLoader loading={loading} />
            <TapGestureHandler
              ref={tap}
              waitFor={doubleTap}
              onGestureEvent={singleTapHandler}
              maxDeltaX={10}
              maxDeltaY={10}>
              <Animated.View style={StyleSheet.absoluteFillObject}>
                <TapGestureHandler
                  maxDurationMs={500}
                  maxDeltaX={10}
                  numberOfTaps={2}
                  ref={doubleTap}
                  onGestureEvent={doubleTapHandler}>
                  <Animated.View
                    style={[styles.controlView, controlViewStyles]}>
                    <Animated.View
                      hitSlop={hitSlop}
                      style={[
                        controlStyle.group,
                        styles.topControls,
                        topControlStyle,
                      ]}>
                      <TapControler onPress={onBackTapHandler}>
                        <Image
                          source={require('./assets/right_16.png')}
                          style={styles.back}
                        />
                      </TapControler>

                      <View style={controlStyle.line}>
                        <Animated.View
                          style={[
                            controlStyle.autoPlayText,
                            autoPlayTextStyle,
                          ]}>
                          <Text
                            tx={
                              allowAutoPlayVideo
                                ? `自动播放已开启`
                                : '自动播放已关闭'
                            }
                            t4
                            color={'#fff'}
                          />
                        </Animated.View>

                        <TapControler
                          onPress={toggleAutoPlay}
                          style={controlStyle.autoPlay}>
                          <AnimatedLottieView
                            animatedProps={autoPlayAnimatedProps}
                            source={require('./assets/lottie-auto-play.json')}
                          />
                        </TapControler>
                        <TapControler onPress={onMoreTapHandler}>
                          <Image
                            source={require('./assets/more_24.png')}
                            style={styles.more}
                          />
                        </TapControler>
                      </View>
                    </Animated.View>
                    <Animated.View
                      style={[
                        controlStyle.group,
                        styles.topControls,
                        styles.topFullscreenControls,
                        topFullscreenControlStyle,
                      ]}>
                      <View style={controlStyle.line}>
                        <TapControler onPress={onBackTapHandler}>
                          <Image
                            source={require('./assets/right_16.png')}
                            style={styles.back}
                          />
                        </TapControler>

                        <Text
                          tx={headerTitle}
                          h5
                          numberOfLines={1}
                          style={styles.headerTitle}
                          color={palette.W(1)}
                        />
                      </View>
                      <View style={controlStyle.line}>
                        <Animated.View
                          style={[
                            controlStyle.autoPlayText,
                            autoPlayTextStyle,
                          ]}>
                          <Text tx="自动播放已开启" t4 color={'#fff'} />
                        </Animated.View>
                        <TapControler
                          onPress={toggleAutoPlay}
                          style={controlStyle.autoPlay}>
                          <AnimatedLottieView
                            animatedProps={autoPlayAnimatedProps}
                            source={require('./assets/lottie-auto-play.json')}
                          />
                        </TapControler>
                        <TapControler onPress={onMoreTapHandler}>
                          <Image
                            source={require('./assets/more_24.png')}
                            style={styles.more}
                          />
                        </TapControler>
                      </View>
                    </Animated.View>
                    <View style={controlStyle.pauseView}>
                      <TapControler
                        onPress={onPauseTapHandler}
                        style={controlStyle.pause}>
                        <AnimatedLottieView
                          animatedProps={playAnimatedProps}
                          source={require('./assets/lottie-play.json')}
                        />
                      </TapControler>
                    </View>
                    <Animated.View
                      style={[
                        controlStyle.group,
                        controlStyle.bottomControls,
                        bottomControlStyle,
                      ]}>
                      <View
                        style={[
                          controlStyle.bottomControlGroup,
                          controlStyle.row,
                        ]}>
                        <TapControler onPress={toggleTimer}>
                          <Text style={controlStyle.timerText}>
                            <Text
                              style={controlStyle.timerText}
                              color={palette.W(1)}
                              tx={calculateTime()}
                              t3
                            />
                            <Text
                              style={controlStyle.timerText}
                              color={palette.W(1)}
                              tx={` / ${formatTimeToMins(
                                player.current.duration,
                              )}`}
                              t3
                            />
                          </Text>
                        </TapControler>
                        <TapControler
                          onPress={toggleFullScreen}
                          style={controlStyle.fullToggle}>
                          <AnimatedLottieView
                            animatedProps={fullscreenAnimatedProps}
                            source={require('./assets/lottie-fullscreen.json')}
                          />
                        </TapControler>
                      </View>
                      <Animated.View
                        style={[
                          {
                            width:
                              height -
                              insetsRef.current.top -
                              insetsRef.current.bottom -
                              40,
                          },
                          fullScreenSliderStyle,
                        ]}>
                        <Slider
                          minimumTrackTintColor={palette.Main(1)}
                          maximumTrackTintColor={palette.B(0.3)}
                          progress={progress}
                          onSlidingComplete={onSlidingComplete}
                          onSlidingStart={onSlidingStart}
                          minimumValue={min}
                          maximumValue={max}
                          isScrubbing={isScrubbing}
                          bubble={secondToTime}
                          disableTapEvent
                          onTap={onTapSlider}
                          thumbScaleValue={controlViewOpacity}
                          thumbWidth={8}
                          sliderHeight={2}
                        />
                      </Animated.View>
                    </Animated.View>
                  </Animated.View>
                </TapGestureHandler>
                <Ripple
                  ref={rippleLeft}
                  onAnimationEnd={() => {
                    doubleLeftOpacity.value = 0;
                  }}
                  style={[controlStyle.doubleTap, controlStyle.leftDoubleTap]}
                  containerStyle={[{ width: leftDoubleTapBoundary }]}>
                  <Animated.View style={getDoubleLeftStyle}>
                    <LottieView
                      source={require('./assets/lottie-seek-back.json')}
                      autoPlay
                      loop
                      style={controlStyle.backStep}
                    />
                    <Text tx="back 10s" color={palette.W(1)} t5 />
                  </Animated.View>
                </Ripple>

                <Ripple
                  ref={rippleRight}
                  onAnimationEnd={() => {
                    doubleRightOpacity.value = 0;
                  }}
                  style={[
                    controlStyle.doubleTap,
                    controlStyle.rightDoubleTapContainer,
                  ]}
                  containerStyle={[{ width: leftDoubleTapBoundary }]}>
                  <Animated.View style={getDoubleRightStyle}>
                    <LottieView
                      source={require('./assets/lottie-seek-back.json')}
                      autoPlay
                      loop
                      style={[
                        controlStyle.backStep,
                        { transform: [{ rotate: '90deg' }] },
                      ]}
                    />
                    <Text tx="ahead 10s" color={palette.W(1)} t5 />
                  </Animated.View>
                </Ripple>
              </Animated.View>
            </TapGestureHandler>
          </Animated.View>

          {isIos && (
            <View
              style={[styles.stopBackView, { left: -insets.left }]}
              pointerEvents={isFullscreen ? 'auto' : 'none'}
            />
          )}
        </Animated.View>
      </PanGestureHandler>
      <Animated.View
        style={[styles.backdrop, backdropStyles]}
        pointerEvents={'none'}
      />
      <Animated.View style={[styles.slider, bottomSliderStyle]}>
        <Slider
          minimumTrackTintColor={palette.Main(1)}
          maximumTrackTintColor={palette.B(0.6)}
          cacheTrackTintColor={palette.G1(1)}
          progress={progress}
          onSlidingComplete={onSlidingComplete}
          onSlidingStart={onSlidingStart}
          minimumValue={min}
          maximumValue={max}
          isScrubbing={isScrubbing}
          bubble={(value: number) => {
            return secondToTime(value);
          }}
          bubbleBackgroundColor={palette.B(0.8)}
          disableTapEvent
          onTap={onTapSlider}
          thumbScaleValue={controlViewOpacity}
          thumbWidth={12}
          sliderHeight={2}
          style={{ left: 0, top: 0, zIndex: 100 }}
        />
      </Animated.View>
    </>
  );
};
export default VideoPlayer;
/**
 * This object houses our styles. There's player
 * specific styles and control specific ones.
 * And then there's volume/seeker styles.
 */
const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
    flex: 1,
    zIndex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  controlView: {
    backgroundColor: 'rgba(0,0,0,.6)',
    justifyContent: 'center',
    overflow: 'hidden',
    ...StyleSheet.absoluteFillObject,
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTitle: {
    marginLeft: 20,
    maxWidth: height / 2,
  },
  slider: {
    width: width,
    zIndex: 100,
    position: 'absolute',
    left: 0,
    right: 0,
  },

  stopBackView: {
    height: '100%',
    position: 'absolute',
    width: 40,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 12,
    width: '100%',
  },
  topFullscreenControls: {
    top: 32,
  },
  video: {
    overflow: 'hidden',
    ...StyleSheet.absoluteFillObject,
  },
  view: {},
  viewContainer: {
    width: '100%',
  },
  back: {
    width: 16,
    height: 16,
    zIndex: 100,
  },
  backLarge: {
    width: 24,
    height: 24,
  },
  more: {
    width: 24,
    height: 24,
  },
});

const controlStyle = StyleSheet.create({
  autoPlay: {
    height: 24,
    marginRight: 32,
    width: 24,
  },
  autoPlayText: {
    marginRight: 10,
  },
  bottomControlGroup: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  bottomControls: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
  fullToggle: {
    height: 20,
    width: 20,
  },
  group: {
    paddingHorizontal: 20,
  },
  line: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  pause: {
    height: 48,
    width: 48,
  },
  pauseView: {
    alignSelf: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  timerText: {
    textAlign: 'right',
  },
  doubleTap: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },

  leftDoubleTap: {
    left: 0,
    borderTopRightRadius: width,
    borderBottomRightRadius: width,
  },

  rightDoubleTapContainer: {
    borderTopLeftRadius: width,
    borderBottomLeftRadius: width,
    right: 0,
  },
  backStep: {
    width: 40,
    height: 40,
  },
});
