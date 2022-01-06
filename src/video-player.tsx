import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStores } from 'app/models';
import { AutoPlayModeEmun } from 'app/models/operation-store/operation-store';
import { RootParamList } from 'app/navigators';
import { isIos, normalize } from 'app/utils';
import { width } from 'app/utils/ui-tools';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  GestureEvent,
  TapGestureHandler,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Slider from 'react-native-reanimated-slider-42';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video, {
  OnLoadData,
  OnProgressData,
  OnSeekData,
  VideoProperties,
} from 'react-native-video';
import { color } from '../../theme';
import { palette } from '../../theme/palette';
import { Icon, Text } from '../index';
import { VideoError } from './video-error';
import { VideoLoader } from './video-loading';
import { VideoReplayed } from './video-replay';
import { formatTime, secondToTime } from './video-utils';

const VIDEO_DEFAULT_HEIGHT = width * (9 / 16);
const VIDEO_FULL_SPACE = 0;

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
  headerTop?: number;
  videoDefaultHeight?: number;
  videoDefaultWidth?: number;
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
  controlTimeout,
  headerTop = 0,
  videoDefaultHeight = VIDEO_DEFAULT_HEIGHT,
  videoDefaultWidth = width,
  ...rest
}) => {
  /**
   * hooks
   */
  const { operationStoreModel } = useStores();
  const { autoPlayMode, changeAutoPlayMode } = operationStoreModel;
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const videoTarget = {
    width: dimensions.height - insets.top - insets.bottom,
    height: dimensions.width,
  };
  /**
   * state
   */
  const [paused, setPaused] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
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
    controlTimeoutDelay: controlTimeout || 5000,
    controlTimeout: null,
    duration: 0,
    scrubbing: false,
    seeking: false,
    originallyPaused: false,
    isPlayed: false,
    playableDuration: new Animated.Value(0),
    seekableDuration: new Animated.Value(0),
    progress: new Animated.Value(0),
  });

  const videoPlayer = useRef<Video>(null);
  const mounted = useRef(false);

  /**
   * reanimated
   */
  const fullScreen = useSharedValue(0);
  const rotate = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const controlViewOpacity = useSharedValue(showOnStart ? 1 : 0);

  const playpause = useSharedValue(0.5);
  const videoWidth = useSharedValue(videoDefaultWidth);
  const videoHeight = useSharedValue(videoDefaultHeight);

  const videoContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(
            fullScreen.value === 0
              ? 0
              : -(videoTarget.height / 2 - (isIos ? 10 : 0)),
          ),
        },
        {
          translateY: withTiming(
            fullScreen.value === 0
              ? headerTop
              : (videoTarget.width - width) / 2 + insets.top,
          ),
        },
        {
          rotateZ: `${rotate.value}deg`,
        },
      ],
      width: withTiming(videoWidth.value),
      height: withTiming(videoHeight.value),
    };
  }, []);

  const backdropStyles = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });
  const controlViewStyles = useAnimatedStyle(() => {
    return {
      opacity: controlViewOpacity.value,
    };
  });

  /**
   * useEffect
   */
  useEffect(() => {
    mounted.current = true;
    checkPalyerMode();
    const removeNavigationFocus = navigation.addListener('focus', () => {
      StatusBar.setBarStyle('dark-content', true);

      checkPalyerMode();
    });
    const removeNavigationBlur = navigation.addListener('blur', () => {
      pause();
    });
    return () => {
      mounted.current = false;
      clearControlTimeout();
      removeNavigationFocus();
      removeNavigationBlur();
      pause();
    };
  }, []);

  /**
   * check player play mode
   * @returns void
   */
  const checkPalyerMode = async () => {
    if (autoPlayMode === AutoPlayModeEmun.ALL_OPEN) {
      play();
      return;
    }
    if (autoPlayMode === AutoPlayModeEmun.ALL_CLOSE) {
      pause();
      return;
    }
    if (autoPlayMode === AutoPlayModeEmun.ONLY_WIFI_OPEN) {
      const netInfo = await NetInfo.fetch();
      if (netInfo.type === NetInfoStateType.wifi) {
        play();
      }
    } else {
      Alert.alert('您正在使用非Wifi网络，播放可能将消耗流量。', '', [
        {
          text: '继续播放',
          style: 'destructive',
          onPress: () => {
            changeAutoPlayMode(AutoPlayModeEmun.ALL_OPEN);
            play();
          },
        },
        {
          text: '取消',
          style: 'cancel',
          onPress: () => {
            changeAutoPlayMode(AutoPlayModeEmun.ALL_CLOSE);
            pause();
          },
        },
      ]);
    }
  };
  /**
   * Set a timeout when the controls are shown
   * that hides them after a length of time.
   */
  const setControlTimeout = () => {
    player.current.controlTimeout = setTimeout(() => {
      hideControlAnimation();
    }, player.current.controlTimeoutDelay);
  };

  /**
   * Clear the hide controls timeout.
   */
  const clearControlTimeout = () => {
    clearTimeout(player.current.controlTimeout);
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
    controlViewOpacity.value = withTiming(1);
  };

  /**
   * Function to hide the controls. Sets our
   * state then calls the animation.
   */
  const hideControlAnimation = () => {
    'worklet';
    if (mounted.current) {
      controlViewOpacity.value = withTiming(0);
    }
  };
  const toggleControls = () => {
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
      setControlTimeout();
    } else {
      hideControlAnimation();
      clearControlTimeout();
    }
  };

  const togglePlayPause = () => {
    resetControlTimeout();
    paused ? play() : pause();
  };
  const singleTapHandler = useAnimatedGestureHandler<
    GestureEvent<TapGestureHandlerEventPayload>
  >({
    onActive: () => {
      runOnJS(toggleControls)();
    },
  });
  const onPauseTapHandler = useAnimatedGestureHandler<
    GestureEvent<TapGestureHandlerEventPayload>
  >({
    onActive: () => {
      runOnJS(togglePlayPause)();
    },
  });

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

  /**
   * Calculate the time to show in the timer area
   * based on if they want to see time remaining
   * or duration. Formatted to look as 00:00.
   */
  const calculateTime = () => {
    if (state.showTimeRemaining) {
      const time = player.current.duration - currentTime;
      return `-${formatTime({ time, duration: player.current.duration })}`;
    }
    return formatTime({ time: currentTime, duration: player.current.duration });
  };

  /**
   * Seek to a time in the video.
   *
   * @param {float} time time to seek to in ms
   */
  const seekTo = (time = 0) => {
    setCurrentTime(time);
    videoPlayer.current.seek(time);
  };
  const onLoad = (data: OnLoadData) => {
    player.current.duration = data?.duration;
    player.current.seekableDuration.setValue(
      data?.duration as Animated.Adaptable<0>,
    );
    setIsLoading(false);
    setControlTimeout();
  };
  const onEnd = () => {
    setIsPlayed(true);
  };
  /**
   * For onSeek we clear scrubbing if set.
   *
   * @param {object} data The video meta data
   */
  const onSeek = (data: OnSeekData) => {
    if (player.current.scrubbing) {
      // Seeking may be false here if the user released the seek bar while the player was still processing
      // the last seek command. In this case, perform the steps that have been postponed.
      if (!player.current.seeking) {
        setControlTimeout();
        player.current.originallyPaused ? play() : pause();
      }
      player.current.scrubbing = false;
      setCurrentTime(data.currentTime);
    }
  };

  /**
   * For onprogress we fire listeners that
   * update our seekbar and timer.
   *
   * @param {object} data The video meta data
   */
  const onProgress = ({ currentTime }: OnProgressData) => {
    if (!player.current.scrubbing) {
      if (!player.current.seeking) {
        player.current.progress.setValue(currentTime as Animated.Adaptable<0>);
      }
      setCurrentTime(currentTime);
    }
  };
  /**
   * on replay video
   */
  const onReplyVideo = () => {
    setIsPlayed(false);
    seekTo(0);
    setCurrentTime(0);
    player.current.progress.setValue(0);
  };
  /**
   * play the video
   */
  const play = () => {
    setPaused(false);
    playpause.value = withTiming(0.5);
  };

  /**
   * pause the video
   */
  const pause = () => {
    setPaused(true);
    playpause.value = withTiming(0);
  };
  const animatedProps = useAnimatedProps(() => {
    return {
      progress: playpause.value,
    };
  });

  /**
   * Toggle player full screen state on <Video> component
   */
  const toggleFullScreen = () => {
    if (controlViewOpacity.value === 0) {
      showControlAnimation();
      return;
    }
    resetControlTimeout();
    setState({
      ...state,
      resizeMode: toggleResizeModeOnFullscreen
        ? !isFullscreen
          ? 'cover'
          : 'contain'
        : resizeMode,
    });
    setIsFullscreen(state => !state);

    fullScreen.value = fullScreen.value === 0 ? 1 : 0;

    rotate.value = withTiming(fullScreen.value === 0 ? 90 : 0);

    backdropOpacity.value = withTiming(backdropOpacity.value === 0 ? 1 : 0);

    videoHeight.value =
      videoHeight.value === videoDefaultHeight
        ? videoTarget.height
        : videoDefaultHeight;

    videoWidth.value =
      videoWidth.value === videoDefaultWidth
        ? videoTarget.width
        : videoDefaultWidth;
    // callback
    isFullscreen ? onEnterFullscreen?.() : onExitFullscreen?.();
  };

  /**
   * Render the seekbar and attach its handlers
   */
  const onSlidingComplete = (val: number) => {
    seekTo(val);
    player.current.seeking = false;
    player.current.scrubbing = false;
  };
  const onSlidingStart = () => {
    player.current.scrubbing = true;
    player.current.seeking = true;
    clearControlTimeout();
  };

  return (
    <>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.view,
          videoContainerStyle,
        ]}>
        <Video
          {...rest}
          ref={videoPlayer}
          resizeMode={state.resizeMode}
          volume={state.volume}
          paused={paused}
          muted={state.muted}
          rate={state.rate}
          onLoadStart={onLoadStart}
          style={[playerStyle.video, style]}
          source={source}
          onLoad={onLoad}
          onSeek={onSeek}
          onEnd={onEnd}
          onProgress={onProgress}
          fullscreenAutorotate={true}
        />

        <VideoError state={state.error} />
        <VideoLoader loading={loading} />
        <VideoReplayed isPlayed={isPlayed} onPress={onReplyVideo} />
        <TapGestureHandler
          onGestureEvent={singleTapHandler}
          maxDeltaX={10}
          maxDeltaY={10}>
          <Animated.View style={[styles.controlView, controlViewStyles]}>
            <View style={[controlStyle.bottomControlGroup, controlStyle.row]}>
              <TapGestureHandler onGestureEvent={onPauseTapHandler}>
                <AnimatedLottieView
                  animatedProps={animatedProps}
                  source={require('./lottie-play.json')}
                  style={controlStyle.pause}
                />
              </TapGestureHandler>
              <Slider
                style={seekbarStyle.container}
                minimumTrackTintColor={palette.Main(1)}
                maximumTrackTintColor={palette.W(0.3)}
                thumbTintColor={palette.W(1)}
                borderColor={color.transparent}
                progress={player.current.progress}
                onSlidingComplete={onSlidingComplete}
                onSlidingStart={onSlidingStart}
                thumbStyle={controlStyle.thumbStyle}
                trackStyle={controlStyle.trackStyle}
                min={new Animated.Value(0)}
                max={player.current.seekableDuration}
                ballon={(value: number) => {
                  return secondToTime(value);
                }}
              />
              <TapGestureHandler onActivated={toggleTimer}>
                <Text
                  style={controlStyle.timerText}
                  color={palette.W(1)}
                  tx={calculateTime()}
                  t5
                />
              </TapGestureHandler>
              <TapGestureHandler onActivated={toggleFullScreen}>
                <View style={controlStyle.fullToggle}>
                  <Icon
                    name={'i-a-ic_fullscreen_24'}
                    size={18}
                    color={palette.W(1)}
                  />
                </View>
              </TapGestureHandler>
            </View>
          </Animated.View>
        </TapGestureHandler>
      </Animated.View>
      <Animated.View
        style={[styles.backdrop, backdropStyles]}
        pointerEvents={isFullscreen ? 'auto' : 'none'}
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
    backgroundColor: color.B(1),
    flex: 1,
    zIndex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  controlView: {
    backgroundColor: color.B(0.6),
    justifyContent: 'flex-end',
    ...StyleSheet.absoluteFillObject,
  },
  view: {
    backgroundColor: palette.G7(1),
    elevation: 10,
    overflow: 'hidden',
    zIndex: 10,
  },
});
const seekbarStyle = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 40,
  },
});
const playerStyle = StyleSheet.create({
  video: {
    overflow: 'hidden',
    ...StyleSheet.absoluteFillObject,
  },
});

const controlStyle = StyleSheet.create({
  bottomControlGroup: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 0,
    marginLeft: 12,
    marginRight: 12,
  },

  control: {
    padding: 16,
  },
  fullToggle: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },

  pause: {
    height: 40,
    left: 0,
    position: 'absolute',
    width: 40,
  },

  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: null,
    justifyContent: 'space-between',
    width: null,
  },

  thumbStyle: {
    backgroundColor: palette.W(1),
    height: normalize(8),
    width: normalize(2),
  },

  timerText: {
    textAlign: 'right',
    width: normalize(40),
  },

  trackStyle: { height: normalize(2) },
});
