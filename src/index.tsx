import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
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
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video, {
  OnLoadData,
  OnProgressData,
  OnSeekData,
  VideoProperties,
} from 'react-native-video';
import { VideoLoader } from './video-loading';
import { secondToTime, formatTimeToMins } from './video-utils';
import { bin, isIos, useVector } from './utils';
import { Dimensions } from 'react-native';
import { palette } from './theme/palette';
import { Text } from './components';
import { Image } from 'react-native';
import { TapControler } from './tap-controler';

export const { width, height, scale, fontScale } = Dimensions.get('window');

const VIDEO_DEFAULT_HEIGHT = width * (9 / 16);

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
}
const VideoPlayer: React.FC<IProps> = ({
  resizeMode = 'contain',
  showOnStart = true,
  muted = false,
  volume = 1,
  rate = 1,
  showTimeRemaining = true,
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
  ...rest
}) => {
  /**
   * hooks
   */
  const insets = useSafeAreaInsets();
  const insetsRef = useRef(insets);

  /**
   * state
   */
  const [paused, setPaused] = useState(false);
  const [state, setState] = useState({
    // Video
    resizeMode: resizeMode,
    muted: muted,
    volume: volume,
    rate: rate,
    // Controls
    showTimeRemaining: showTimeRemaining,
    showHours: showHours,
    error: false,
    showRemainingTime: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setIsLoading] = useState(false);

  /**
   * refs
   */
  const player = useRef({
    duration: 0,
  });
  const videoPlayer = useRef<Video>(null);
  const mounted = useRef(false);

  /**
   * reanimated value
   */
  const fullScreen = useSharedValue(false);
  const isLoadEnd = useSharedValue(false);

  const backdropOpacity = useSharedValue(0);
  const controlViewOpacity = useSharedValue(showOnStart ? 1 : 0);

  const playAnimated = useSharedValue(0.5);

  const videoContainerInfo = useVector(videoDefaultWidth, videoDefaultHeight);

  const max = useSharedValue(100);
  const min = useSharedValue(0);
  const isScrubbing = useSharedValue(false);
  const isSeeking = useRef(false);
  const progress = useSharedValue(0);

  const videoStyle = useAnimatedStyle(() => {
    return {
      height: videoContainerInfo.y.value,
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
  const pauseStyle = useAnimatedStyle(() => {
    return {
      width: fullScreen.value ? 60 : 48,
      height: fullScreen.value ? 60 : 48,
    };
  });
  const bottomSliderStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(bin(!fullScreen.value)),
    };
  });
  const fullScreenSliderStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(bin(fullScreen.value)),
    };
  });
  const controlViewStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(controlViewOpacity.value, controlAnimteConfig),
    };
  });
  const backdropStyles = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
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
  /**
   * useEffect
   */
  useEffect(() => {
    mounted.current = true;
    Orientation.lockToPortrait();
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

    // controlViewOpacity.value = withDelay(controlTimeout, 0)
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
    controlViewOpacity.value = 1;
  };

  const togglePlayPause = () => {
    if (isLoadEnd.value) {
      onReplyVideo();
      isLoadEnd.value = false;
    }
    resetControlTimeout();
    paused ? play() : pause();
  };

  const singleTapHandler = () => {
    if (controlViewOpacity.value === 0) {
      controlViewOpacity.value = 1;
      setControlTimeout();
    } else {
      controlViewOpacity.value = 0;
    }
  };

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
    setState({
      ...state,
      showTimeRemaining: !state.showTimeRemaining,
    });
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
    return `${formatTimeToMins(currentTime)} / ${formatTimeToMins(
      player.current.duration,
    )}`;
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
   * onPanGesture
   */
  const onPanGesture = useAnimatedGestureHandler<
    GestureEvent<PanGestureHandlerEventPayload>
  >({});
  /**
   * play the video
   */
  const play = () => {
    setPaused(false);
    playAnimated.value = 0.5;
  };

  /**
   * pause the video
   */
  const pause = () => {
    setPaused(true);
    playAnimated.value = 0;
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
      <PanGestureHandler onGestureEvent={onPanGesture}>
        <Animated.View style={styles.viewContainer}>
          <Animated.View style={[styles.view, videoStyle]}>
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
            <VideoLoader loading={loading} />
            <TapGestureHandler
              onActivated={singleTapHandler}
              maxDeltaX={10}
              maxDeltaY={10}>
              <Animated.View style={StyleSheet.absoluteFillObject}>
                <Animated.View style={[styles.controlView, controlViewStyles]}>
                  <TapControler
                    onPress={onBackTapHandler}
                    style={[
                      controlStyle.group,
                      styles.topControls,
                      topControlStyle,
                    ]}>
                    <Image
                      source={require('./assets/right_16.png')}
                      style={styles.back}
                    />
                  </TapControler>

                  <Animated.View
                    style={[
                      controlStyle.group,
                      styles.topControls,
                      styles.topFullscreenControls,
                      topFullscreenControlStyle,
                    ]}>
                    <TapControler onPress={onBackTapHandler}>
                      <Image
                        source={require('./assets/right_16.png')}
                        style={styles.backLarge}
                      />
                    </TapControler>
                    <Text
                      tx={headerTitle}
                      h5
                      numberOfLines={1}
                      style={styles.headerTitle}
                      color={palette.W(1)}
                    />
                  </Animated.View>

                  <TapControler
                    onPress={onPauseTapHandler}
                    style={[controlStyle.pause, pauseStyle]}>
                    <AnimatedLottieView
                      animatedProps={playAnimatedProps}
                      source={require('./assets/lottie-play.json')}
                    />
                  </TapControler>

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
                        <Text
                          style={controlStyle.timerText}
                          color={palette.W(1)}
                          tx={calculateTime()}
                          t4
                        />
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
              </Animated.View>
            </TapGestureHandler>
            <Animated.View style={[styles.slider, bottomSliderStyle]}>
              <Slider
                minimumTrackTintColor={palette.Main(1)}
                maximumTrackTintColor={palette.B(0.3)}
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
                thumbWidth={8}
                sliderHeight={2}
              />
            </Animated.View>
            {isIos && (
              <View
                style={[styles.stopBackView, { left: -insets.left }]}
                pointerEvents={isFullscreen ? 'auto' : 'none'}
              />
            )}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
      <Animated.View
        style={[styles.backdrop, backdropStyles]}
        pointerEvents={'none'}
      />
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
    bottom: 0,
    flex: 1,
    left: 0,
    position: 'absolute',
    width: width,
    zIndex: 100,
  },

  stopBackView: {
    height: '100%',
    position: 'absolute',
    width: 40,
  },
  topControls: {
    flexDirection: 'row',
    position: 'absolute',
    top: 12,
  },
  topFullscreenControls: {
    top: 32,
  },
  video: {
    overflow: 'hidden',
    ...StyleSheet.absoluteFillObject,
  },
  view: {
    width: '100%',
  },
  viewContainer: {
    alignItems: 'center',
    backgroundColor: palette.B(1),
    elevation: 10,
    justifyContent: 'center',
    zIndex: 10,
  },
  back: {
    width: 16,
    height: 16,
  },
  backLarge: {
    width: 24,
    height: 24,
  },
});

const controlStyle = StyleSheet.create({
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
  pause: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,.3)',
    borderRadius: 100,
  },

  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  timerText: {
    textAlign: 'right',
  },
});
