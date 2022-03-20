import LottieView from 'lottie-react-native';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  Slider,
  SliderThemeType,
  AwesomeSliderProps,
} from 'react-native-awesome-slider/src/index';
import { clamp } from 'react-native-awesome-slider/src/utils';
import type { PanGesture } from 'react-native-gesture-handler';
import { Gesture } from 'react-native-gesture-handler';
import { GestureDetector } from 'react-native-gesture-handler';
import Orientation, { OrientationType } from 'react-native-orientation-locker';
import Animated, {
  AnimatedStyleProp,
  cancelAnimation,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video, {
  OnLoadData,
  OnProgressData,
  OnSeekData,
  VideoProperties,
} from 'react-native-video';
import { Text } from './components';
import { Ripple } from './components/ripple';
import { TapControler } from './tap-controler';
import { palette } from './theme/palette';
import { bin, isIos, useRefs } from './utils';
import { VideoLoader } from './video-loading';
import { formatTime, formatTimeToMins, secondToTime } from './video-utils';

export const { width, height, scale, fontScale } = Dimensions.get('window');

const VIDEO_DEFAULT_HEIGHT = width * (9 / 16);
const hitSlop = { left: 8, bottom: 8, right: 8, top: 8 };

const controlAnimteConfig = {
  duration: 200,
};

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

export type VideoProps = VideoProperties & {
  showOnStart?: boolean;
  toggleResizeModeOnFullscreen?: boolean;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  controlTimeout?: number;
  videoDefaultHeight?: number;
  videoDefaultWidth?: number;
  headerBarTitle?: string;
  onTapBack?: () => void;
  navigation?: any;
  autoPlay?: boolean;
  onToggleAutoPlay?: (state: boolean) => void;
  onTapMore?: () => void;
  doubleTapInterval?: number;
  theme?: SliderThemeType;
  paused: boolean;
  onPausedChange: (paused: boolean) => void;
  onTapPause?: (paused: boolean) => void;
  sliderProps?: Pick<
    AwesomeSliderProps,
    | 'renderBubble'
    | 'bubble'
    | 'bubbleMaxWidth'
    | 'bubbleWidth'
    | 'bubbleTranslateY'
  >;
  videoHeight: Animated.SharedValue<number>;
  customAnimationStyle?: AnimatedStyleProp<ViewStyle>;
  onCustomPanGesture?: PanGesture;
};
export type VideoPlayerRef = {
  setPlay: () => void;
  setPause: () => void;
  toggleFullSreen: (isFullScreen: boolean) => void;
  toggleControlViewOpacity: (isShow: boolean) => void;
  setSeekTo: (second: number) => void;
};

const VideoPlayer = forwardRef<VideoPlayerRef, VideoProps>(
  (
    {
      resizeMode = 'contain',
      showOnStart = true,
      muted = false,
      volume = 1,
      rate = 1,
      source,
      style,
      toggleResizeModeOnFullscreen = true,
      onEnterFullscreen,
      onExitFullscreen,
      controlTimeout = 2000,
      videoDefaultHeight = VIDEO_DEFAULT_HEIGHT,
      headerBarTitle = '',
      onTapBack,
      navigation,
      autoPlay = false,
      onToggleAutoPlay,
      onTapMore,
      doubleTapInterval = 500,
      theme = {
        minimumTrackTintColor: palette.Main(1),
        maximumTrackTintColor: palette.B(0.6),
        cacheTrackTintColor: palette.G1(1),
        bubbleBackgroundColor: palette.B(0.8),
      },
      paused,
      onPausedChange,
      onTapPause,
      sliderProps,
      videoHeight,
      customAnimationStyle,
      onCustomPanGesture,
      ...rest
    },
    ref,
  ) => {
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
    const [state, setState] = useState({
      // Video
      resizeMode: resizeMode,
      muted: muted,
      volume: volume,
      rate: rate,
      // Controls
      error: false,
      showRemainingTime: false,
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [loading, setIsLoading] = useState(false);
    const [showTimeRemaining, setShowTimeRemaining] = useState(true);
    const [allowAutoPlayVideo, setAllowAutoPlayVideo] = useState(autoPlay);

    useImperativeHandle(ref, () => ({
      setPlay: () => {
        checkTapTakesEffect();
        play();
      },
      setPause: () => {
        checkTapTakesEffect();
        pause();
      },
      toggleFullSreen: (isFullScrren: boolean) => {
        isFullScrren ? enterFullScreen() : exitFullScreen();
      },
      toggleControlViewOpacity: (isShow: boolean) => {
        'worklet';
        isShow ? showControlAnimation() : hideControlAnimation();
      },
      setSeekTo: (seconds: number) => {
        seekTo(seconds);
      },
    }));
    /**
     * refs
     */
    const player = useRef({
      duration: 0,
    });
    const videoPlayer = useRef<Video>(null);
    const mounted = useRef(false);
    const autoPlayAnimation = useSharedValue(autoPlay ? 1 : 0);
    const { rippleLeft, rippleRight } = useRefs();
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

    const videoScale = useSharedValue(1);
    const videoTransY = useSharedValue(0);
    const panIsVertical = useSharedValue(false);

    const doubleTapIsAlive = useSharedValue(false);

    const max = useSharedValue(100);
    const min = useSharedValue(0);
    const isScrubbing = useSharedValue(false);
    const isSeeking = useRef(false);
    const progress = useSharedValue(0);
    const defaultVideoStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: videoScale.value,
          },
          {
            translateY: videoTransY.value,
          },
        ],
        height: videoHeight.value,
      };
    }, []);
    const videoStyle = customAnimationStyle
      ? customAnimationStyle
      : defaultVideoStyle;

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
        top: videoHeight.value + insets.top,
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
      StatusBar.setBarStyle('light-content');
      paused ? pause() : play();
      const unBeforeRemove = navigation?.addListener(
        'beforeRemove',
        (e: any) => {
          e?.preventDefault();
          if (fullScreen.value) {
            toggleFullScreen();
          } else {
            navigation.dispatch(e.data.action);
          }
        },
      );
      return () => {
        mounted.current = false;
        clearControlTimeout();
        pause();
        Orientation.lockToPortrait();
        unBeforeRemove && unBeforeRemove();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Set a timeout when the controls are shown
     * that hides them after a length of time.
     */
    const setControlTimeout = () => {
      'worklet';
      controlViewOpacity.value = withDelay(controlTimeout, withTiming(0));
    };

    /**
     * Clear the hide controls timeout.
     */
    const clearControlTimeout = () => {
      'worklet';
      cancelAnimation(controlViewOpacity);
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
     * Animation to show controls
     * fade in.
     */
    const showControlAnimation = () => {
      'worklet';
      controlViewOpacity.value = withTiming(1, controlAnimteConfig);
      setControlTimeout();
    };
    /**
     * Animation to show controls
     * fade out.
     */
    const hideControlAnimation = () => {
      'worklet';
      controlViewOpacity.value = withTiming(0, controlAnimteConfig);
    };
    /**
     * check on tap icon
     * @returns bool
     */
    const checkTapTakesEffect = () => {
      'worklet';
      resetControlTimeout();
      if (controlViewOpacity.value === 0) {
        showControlAnimation();
        return false;
      }
      return true;
    };

    const seekByStep = (isBack = false) => {
      seekTo(currentTime - (isBack ? 10 : -10));
    };

    /**
     * Toggle player full screen state on <Video> component
     */
    const enterFullScreen = () => {
      StatusBar.setHidden(true, 'fade');
      backdropOpacity.value = 1;
      Orientation.lockToLandscape();
      fullScreen.value = true;
      videoHeight.value = width;
      onEnterFullscreen?.();
    };

    const exitFullScreen = () => {
      StatusBar.setHidden(false, 'fade');
      Orientation.lockToPortrait();
      fullScreen.value = false;
      videoHeight.value = videoDefaultHeight;
      onExitFullscreen?.();
      backdropOpacity.value = 0;
    };
    const toggleFullScreenOnJS = () => {
      Orientation.getOrientation(orientation => {
        if (fullScreen.value || orientation !== OrientationType.PORTRAIT) {
          exitFullScreen();
          StatusBar.setHidden(false, 'fade');
        } else {
          enterFullScreen();
          StatusBar.setHidden(true, 'fade');
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
    const toggleFullScreen = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      runOnJS(toggleFullScreenOnJS)();
    };

    /**
     * on pan event
     */
    const defalutPanGesture = Gesture.Pan()
      .onStart(({ velocityY, velocityX }) => {
        panIsVertical.value = Math.abs(velocityY) > Math.abs(velocityX);
      })
      .onUpdate(({ translationY }) => {
        controlViewOpacity.value = withTiming(0, { duration: 100 });
        if (fullScreen.value) {
          if (translationY > 0 && Math.abs(translationY) < 100) {
            videoScale.value = clamp(
              0.9,
              1 - Math.abs(translationY) * 0.008,
              1,
            );
            videoTransY.value = translationY;
          }
        } else {
          if (translationY < 0 && Math.abs(translationY) < 40) {
            videoScale.value = Math.abs(translationY) * 0.012 + 1;
          }
        }
      })
      .onEnd(({ translationY }, success) => {
        if (!panIsVertical.value && !success) {
          return;
        }
        if (fullScreen.value) {
          if (translationY >= 100) {
            runOnJS(exitFullScreen)();
          }
        } else {
          if (-translationY >= 40) {
            runOnJS(enterFullScreen)();
          }
        }
        videoTransY.value = 0;
        videoScale.value = withTiming(1);
      });

    const onPanGesture = onCustomPanGesture
      ? onCustomPanGesture
      : defalutPanGesture;

    const singleTapHandler = Gesture.Tap().onEnd((_event, success) => {
      if (success) {
        if (controlViewOpacity.value === 0) {
          controlViewOpacity.value = withTiming(1, controlAnimteConfig);
          setControlTimeout();
        } else {
          controlViewOpacity.value = withTiming(0, controlAnimteConfig);
        }
      }
    });

    const doubleTapHandle = Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(doubleTapInterval)
      .onStart(({ x }) => {
        doubleTapIsAlive.value =
          x < leftDoubleTapBoundary && x > rightDoubleTapBoundary;
      })
      .onEnd(({ x, y, numberOfPointers }, success) => {
        if (success) {
          if (numberOfPointers !== 1) {
            return;
          }
          if (!doubleTapIsAlive.value) {
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
        }
      });
    /**
     * On toggle play
     * @returns
     */
    const togglePlayOnJS = () => {
      if (isLoadEnd.value) {
        onReplyVideo();
        isLoadEnd.value = false;
      }
      onTapPause?.(!paused);
      paused ? play() : pause();
    };
    const onPauseTapHandler = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      runOnJS(togglePlayOnJS)();
    };
    /**
     * on tap back
     * @returns
     */
    const onBackTapHandlerOnJS = () => {
      Orientation.getOrientation(orientation => {
        if (fullScreen.value || orientation !== OrientationType.PORTRAIT) {
          setIsFullscreen(false);
          exitFullScreen();
          StatusBar.setHidden(false, 'fade');
        } else {
          onTapBack?.();
        }
      });
    };
    const onBackTapHandler = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      runOnJS(onBackTapHandlerOnJS)();
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
    const toggleTimerOnJS = () => {
      setShowTimeRemaining(!showTimeRemaining);
    };
    const toggleTimer = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      runOnJS(toggleTimerOnJS)();
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
    const onProgress = ({ currentTime: cTime }: OnProgressData) => {
      if (!isScrubbing.value) {
        if (!isSeeking.current) {
          progress.value = cTime;
        }
        setCurrentTime(cTime);
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
      onPausedChange(false);
      playAnimated.value = 0;
    };

    /**
     * pause the video
     */
    const pause = () => {
      onPausedChange(true);
      playAnimated.value = 0.5;
    };
    /**
     * on toggle auto play mode
     * @returns
     */
    const toggleAutoPlayOnJS = () => {
      setAllowAutoPlayVideo(!allowAutoPlayVideo);
      onToggleAutoPlay?.(!allowAutoPlayVideo);
    };
    const toggleAutoPlay = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }

      autoPlayAnimation.value = autoPlayAnimation.value === 0 ? 0.5 : 0;
      autoPlayTextAnimation.value = withTiming(1);
      autoPlayTextAnimation.value = withDelay(3000, withTiming(0));
      runOnJS(toggleAutoPlayOnJS)();
    };

    const onMoreTapHandler = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      if (onTapMore) {
        runOnJS(onTapMore)();
      }
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
    const taps = Gesture.Exclusive(doubleTapHandle, singleTapHandler);
    const gesture = Gesture.Race(onPanGesture, taps);
    return (
      <>
        <StatusBar
          barStyle={'light-content'}
          translucent
          backgroundColor={'#000'}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.viewContainer}>
              <Animated.View style={[videoStyle]}>
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

              <Animated.View style={StyleSheet.absoluteFillObject}>
                <Animated.View style={[styles.controlView, controlViewStyles]}>
                  <Animated.View
                    hitSlop={hitSlop}
                    style={[
                      controlStyle.group,
                      styles.topControls,
                      topControlStyle,
                    ]}>
                    <View style={styles.back}>
                      {Boolean(onTapBack) && (
                        <TapControler onPress={onBackTapHandler}>
                          <Image
                            source={require('./assets/right_16.png')}
                            style={styles.back}
                          />
                        </TapControler>
                      )}
                    </View>
                    <View style={controlStyle.line}>
                      {Boolean(onToggleAutoPlay) && (
                        <Animated.View
                          style={[
                            controlStyle.autoPlayText,
                            autoPlayTextStyle,
                          ]}>
                          <Text
                            tx={
                              allowAutoPlayVideo
                                ? 'Autoplay is on'
                                : 'Autoplay is off'
                            }
                            t4
                            color={'#fff'}
                          />
                        </Animated.View>
                      )}

                      {Boolean(onToggleAutoPlay) && (
                        <TapControler
                          onPress={toggleAutoPlay}
                          style={controlStyle.autoPlay}>
                          <AnimatedLottieView
                            animatedProps={autoPlayAnimatedProps}
                            source={require('./assets/lottie-auto-play.json')}
                          />
                        </TapControler>
                      )}
                      {Boolean(onTapMore) && (
                        <TapControler onPress={onMoreTapHandler}>
                          <Image
                            source={require('./assets/more_24.png')}
                            style={styles.more}
                          />
                        </TapControler>
                      )}
                    </View>
                  </Animated.View>
                  <Animated.View
                    style={[
                      controlStyle.group,
                      styles.topControls,
                      styles.topFullscreenControls,
                      topFullscreenControlStyle,
                    ]}
                    pointerEvents={isFullscreen ? 'auto' : 'none'}>
                    <View style={controlStyle.line}>
                      {Boolean(onTapBack) && (
                        <TapControler onPress={onBackTapHandler}>
                          <Image
                            source={require('./assets/right_16.png')}
                            style={styles.back}
                          />
                        </TapControler>
                      )}
                      <Text
                        tx={headerBarTitle}
                        h5
                        numberOfLines={1}
                        style={styles.headerBarTitle}
                        color={palette.W(1)}
                      />
                    </View>
                    <View style={controlStyle.line}>
                      {Boolean(onToggleAutoPlay) && (
                        <Animated.View
                          style={[
                            controlStyle.autoPlayText,
                            autoPlayTextStyle,
                          ]}>
                          <Text tx="自动播放已开启" t4 color={'#fff'} />
                        </Animated.View>
                      )}
                      {Boolean(onToggleAutoPlay) && (
                        <TapControler
                          onPress={toggleAutoPlay}
                          style={controlStyle.autoPlay}>
                          <AnimatedLottieView
                            animatedProps={autoPlayAnimatedProps}
                            source={require('./assets/lottie-auto-play.json')}
                          />
                        </TapControler>
                      )}
                      {Boolean(onTapMore) && (
                        <TapControler onPress={onMoreTapHandler}>
                          <Image
                            source={require('./assets/more_24.png')}
                            style={styles.more}
                          />
                        </TapControler>
                      )}
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
                        theme={theme}
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
                        {...sliderProps}
                      />
                    </Animated.View>
                  </Animated.View>
                </Animated.View>
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
                    <Text tx="10s" isCenter color={palette.W(1)} t5 />
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
                    <Text tx="10s" isCenter color={palette.W(1)} t5 />
                  </Animated.View>
                </Ripple>
              </Animated.View>
            </View>

            {isIos && (
              <View
                style={[styles.stopBackView, { left: -insets.left }]}
                pointerEvents={isFullscreen ? 'auto' : 'none'}
              />
            )}
          </Animated.View>
        </GestureDetector>
        <Animated.View
          style={[styles.backdrop, backdropStyles]}
          pointerEvents={'none'}
        />
        <Animated.View style={[styles.slider, bottomSliderStyle]}>
          <Slider
            theme={theme}
            progress={progress}
            onSlidingComplete={onSlidingComplete}
            onSlidingStart={onSlidingStart}
            minimumValue={min}
            maximumValue={max}
            isScrubbing={isScrubbing}
            bubble={(value: number) => {
              return secondToTime(value);
            }}
            disableTapEvent
            onTap={onTapSlider}
            thumbScaleValue={controlViewOpacity}
            thumbWidth={12}
            sliderHeight={2}
            {...sliderProps}
          />
        </Animated.View>
      </>
    );
  },
);
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
  headerBarTitle: {
    marginLeft: 20,
    maxWidth: height / 2,
  },
  slider: {
    width: width,
    zIndex: 1000,
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
  container: {
    alignItems: 'center',
    backgroundColor: palette.B(1),
    elevation: 10,
    justifyContent: 'center',
    zIndex: 10,
    overflow: 'hidden',
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
