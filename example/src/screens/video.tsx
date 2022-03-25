/* eslint-disable react-native/no-inline-styles */
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useContext, useRef, useState } from 'react';
import {
  Image,
  ImageStyle,
  PixelRatio,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableHighlight,
  View,
  ViewStyle,
} from 'react-native';
import { clamp } from 'react-native-awesome-slider/src/utils';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import InkWell from 'react-native-inkwell';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import VideoPlayer, { VideoPlayerRef } from 'react-native-reanimated-player';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ThemeView } from '../components';
import { Icon } from '../components/icon';
import type { IconNames } from '../components/iconfont';
import { Context } from '../context';
import { palette } from '../theme/palette';
import { height, width } from '../utils';
import { mb, mr, mt } from '../utils/ui-tools';
const springConfig = {
  mass: 0.5,
  overshootClamping: true,
};

const px2dp = (px: number) => PixelRatio.roundToNearestPixel(px);
const sliderTranslateY = 6;
const VIDEO_DEFAULT_HEIGHT = width * (9 / 16);
const videoInfo = {
  title: 'Bad Guy',
  album: 'When We All Fall Asleep, Where Do We Go?',
  author: 'Billie Eilish',
  avatar: require('../assets/avatar.jpeg'),
  source: require('../assets/video-demo.mp4'),
  desc: 'A react native video player components demo, this is desc',
  createTime: '2 years ago',
};
const flexRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
};
const Avatar = ({
  size,
  style,
}: {
  size: number;
  style?: StyleProp<ImageStyle>;
}) => (
  <Image
    source={videoInfo.avatar}
    style={[{ width: size, height: size, borderRadius: size }, style]}
  />
);
const options: { icon: IconNames; title: string }[] = [
  {
    icon: 'feedback',
    title: 'Help & feedback',
  },
  {
    icon: 'flagoutline',
    title: 'Report',
  },
  {
    icon: 'setting',
    title: 'Setting',
  },
];

const VIDEO_SCALE_HEIGHT = 120;

export const VideoScreen = () => {
  const [paused, setPaused] = useState(true);
  const insets = useSafeAreaInsets();
  const SNAP_POINT = [
    0,
    height - 45 - VIDEO_SCALE_HEIGHT - insets.bottom,
    height - 45 - insets.bottom,
  ];
  const [snapPoint, setSnapPoint] = useState(SNAP_POINT[0]);
  const diasbled = Boolean(snapPoint > SNAP_POINT[0]);
  const { colors, dark } = useTheme();
  const descModalRef = useRef<BottomSheetModal>(null);
  const optionsModalRef = useRef<BottomSheetModal>(null);
  const fullViewHeight = height - VIDEO_DEFAULT_HEIGHT - insets.top;
  const indexDesc = useRef(0);
  const indexOptions = useRef(0);
  const isOpened = useRef(false);
  const isTapPaused = useRef(paused);
  const sheetPrevIndex = useRef(-1);
  const indexValue = useSharedValue(0);
  const sheetTranslationY = useSharedValue(0);
  const panTranslationY = useSharedValue(0);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const videoHeight = useSharedValue(VIDEO_DEFAULT_HEIGHT);
  const videoWidth = useSharedValue(width);
  const isFullScreen = useSharedValue(false);
  const panIsVertical = useSharedValue(false);

  const { videoTranslateY } = useContext(Context);

  const pageStyle = useAnimatedStyle(() => {
    const y = panTranslationY.value + sheetTranslationY.value;
    return {
      transform: [
        {
          translateY: clamp(y, 0, height - insets.bottom - 48),
        },
      ],
      backgroundColor: isFullScreen.value ? '#000' : 'transparent',
    };
  }, [panTranslationY, sheetTranslationY]);

  const getVideoContainerStyle = useAnimatedStyle(() => {
    const y = panTranslationY.value + sheetTranslationY.value;
    return {
      backgroundColor: isFullScreen.value ? '#000' : colors.background,
      opacity: interpolate(y, [SNAP_POINT[1], SNAP_POINT[2]], [1, 0]),
    };
  }, [panTranslationY, sheetTranslationY]);

  const customAnimationStyle = useAnimatedStyle(() => {
    const y = panTranslationY.value + sheetTranslationY.value;

    const targetHeight = videoHeight.value * ((height - y) / height);

    let targetWidth = videoWidth.value;

    if (targetHeight < VIDEO_SCALE_HEIGHT) {
      const widthScale = clamp((height - y) / y, 0, 1);
      targetWidth = videoWidth.value * widthScale;
    }
    if (isFullScreen.value) {
      return {
        height: width,
        width: height - insets.left - insets.right,
      };
    }
    return {
      height: clamp(targetHeight, 67.5, VIDEO_DEFAULT_HEIGHT),
      width: clamp(targetWidth, 120, width),
    };
  }, [panTranslationY, sheetTranslationY]);

  const getHeaderBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: indexValue.value,
    };
  });

  const getBodyBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 + indexValue.value,
    };
  });

  const getBackdropStyle = useAnimatedStyle(() => {
    const y = panTranslationY.value + sheetTranslationY.value;
    return {
      opacity: interpolate(
        y,
        [VIDEO_SCALE_HEIGHT, height - VIDEO_DEFAULT_HEIGHT],
        [0, 1],
      ),
    };
  }, [panTranslationY, sheetTranslationY]);

  const getViewBackdropStyle = useAnimatedStyle(() => {
    const y = panTranslationY.value + sheetTranslationY.value;

    return {
      opacity: interpolate(y, [-100, height - VIDEO_DEFAULT_HEIGHT], [1, 0]),
    };
  }, [panTranslationY, sheetTranslationY]);

  const videoThumbInfo = useAnimatedStyle(() => {
    const y = panTranslationY.value + sheetTranslationY.value;

    const opacity = interpolate(
      y,
      [VIDEO_DEFAULT_HEIGHT + VIDEO_SCALE_HEIGHT, height - VIDEO_SCALE_HEIGHT],
      [0, 1],
    );
    return {
      opacity: isFullScreen.value ? 0 : opacity,
    };
  });

  const openModal = () => {
    descModalRef.current?.present();
  };
  const closeDescModal = () => {
    descModalRef.current?.dismiss();
  };
  const renderBackdrop = useCallback(props => {
    return (
      <Animated.View
        style={[
          {
            height,
            width,
          },
          props.style,
        ]}
        pointerEvents="none">
        <Animated.View
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: VIDEO_DEFAULT_HEIGHT + insets.top,
              width,
              backgroundColor: palette.B(1),
              top: 0,
              position: 'absolute',
            },
            getHeaderBackdropStyle,
          ]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: fullViewHeight,
              width,
              backgroundColor: palette.B(1),
              bottom: 0,
              position: 'absolute',
            },
            getBodyBackdropStyle,
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const renderOptionsBackdrop = useCallback(props => {
    return (
      <BottomSheetBackdrop
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        {...props}
      />
    );
  }, []);
  const getDividerStyle = (): ViewStyle => {
    return {
      borderBottomWidth: px2dp(0.5),
      borderColor: colors.border,
    };
  };
  const onSheetChange = (index: number) => {
    if (isOpened.current && !isTapPaused.current) {
      videoPlayerRef.current?.setPlay();
    }
    switch (index) {
      case 1:
        videoPlayerRef.current?.setPause();
        break;
      case 0:
        isOpened.current = true;
        break;
      default:
        isOpened.current = false;

        break;
    }
    sheetPrevIndex.current = index;
  };
  const handleComponent = () => (
    <ThemeView style={styles.modalHeader}>
      <View style={styles.header}>
        <View
          style={[
            styles.block,
            { backgroundColor: dark ? palette.G5(1) : palette.G2(1) },
          ]}
        />
      </View>
      <View style={[styles.handleTitle, getDividerStyle()]}>
        <Text tx="Description" h3 color={dark ? palette.W(1) : palette.G9(1)} />
        <Text tx={videoInfo.createTime} t3 color={colors.text} />
      </View>
    </ThemeView>
  );
  const renderBubble = useCallback(
    () => (
      <Image
        source={require('../assets/snapshot.png')}
        style={styles.snapshot}
      />
    ),
    [],
  );
  const seek = () => {
    videoPlayerRef.current?.setSeekTo(100);
  };

  /**
   * on pan event
   */
  const onHandlerEndOnJS = (point: number) => {
    setSnapPoint(point);
  };
  const onStartOnJS = () => {
    seek();
    videoPlayerRef.current?.toggleControlViewOpacity(false);
    closeDescModal();
  };
  const panGesture = Gesture.Pan()
    .onStart(({ velocityY, velocityX }) => {
      panIsVertical.value = Math.abs(velocityY) > Math.abs(velocityX);
      runOnJS(onStartOnJS)();
    })
    .onUpdate(({ translationY }) => {
      if (!panIsVertical.value) {
        return;
      }
      if (isFullScreen.value) {
        return;
      }
      panTranslationY.value = translationY;
      videoTranslateY.value = sheetTranslationY.value + translationY;
    })
    .onEnd(({ velocityY }, success) => {
      videoPlayerRef.current?.toggleControlViewOpacity(false);
      const dragToss = 0.06;
      const endOffsetY =
        sheetTranslationY.value + panTranslationY.value + velocityY * dragToss;

      if (
        !success &&
        endOffsetY < SNAP_POINT[SNAP_POINT.length - 1] &&
        snapPoint < endOffsetY
      ) {
        return;
      }

      let destSnapPoint = SNAP_POINT[0];
      for (const point of SNAP_POINT) {
        const distFromSnap = Math.abs(point - endOffsetY);
        if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
          console.log(point);

          destSnapPoint = point;
        }
      }
      const finalSheetValue = sheetTranslationY.value + panTranslationY.value;
      sheetTranslationY.value = finalSheetValue;
      panTranslationY.value = 0;
      if (videoTranslateY) {
        videoTranslateY.value = finalSheetValue;
        videoTranslateY.value = withSpring(destSnapPoint, springConfig);
      }

      sheetTranslationY.value = withSpring(destSnapPoint, springConfig);
      runOnJS(onHandlerEndOnJS)(destSnapPoint);
    });

  const foldVideo = () => {
    videoPlayerRef.current?.toggleControlViewOpacity(false);
    const destSnapPoint = SNAP_POINT[SNAP_POINT.length - 1];
    sheetTranslationY.value = withSpring(destSnapPoint, springConfig);
    setSnapPoint(destSnapPoint);
  };
  return (
    <BottomSheetModalProvider>
      <Animated.View
        pointerEvents={'none'}
        style={[
          styles.backdrop,
          { backgroundColor: palette.B(1) },
          getViewBackdropStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.pageView,
          {
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingTop: insets.top,
          },
          pageStyle,
        ]}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'flex-end',
              },
              getVideoContainerStyle,
            ]}>
            <VideoPlayer
              source={videoInfo.source}
              playWhenInactive
              posterResizeMode="cover"
              ignoreSilentSwitch="ignore"
              headerBarTitle={`${videoInfo.author} - ${videoInfo.title}`}
              onTapBack={foldVideo}
              paused={paused}
              onPausedChange={state => {
                setPaused(state);
              }}
              onTapPause={state => {
                isTapPaused.current = state;
              }}
              onTapMore={() => {
                optionsModalRef.current?.present();
              }}
              onToggleAutoPlay={(state: boolean) => {
                console.log(`onToggleAutoPlay state: ${state}`);
              }}
              videoDefaultHeight={VIDEO_DEFAULT_HEIGHT}
              ref={videoPlayerRef}
              sliderProps={{
                renderBubble: renderBubble,
                bubbleTranslateY: -60,
                bubbleWidth: 120,
                bubbleMaxWidth: 120,
                disable: diasbled,
              }}
              videoHeight={videoHeight}
              customAnimationStyle={customAnimationStyle}
              onCustomPanGesture={panGesture}
              style={{ marginBottom: sliderTranslateY }}
              resizeMode="cover"
              isFullScreen={isFullScreen}
              disableControl={diasbled}
              renderBackIcon={() => (
                <Icon
                  name="a-ic_chevrondown_16"
                  size={24}
                  color={palette.W(1)}
                />
              )}
            />
            <Animated.View
              style={[
                { marginBottom: 14, flex: 1, marginLeft: 12, marginRight: 20 },
                videoThumbInfo,
              ]}>
              <Text
                tx={`${videoInfo.author} - ${videoInfo.title}`}
                numberOfLines={1}
                color={colors.text}
              />
              <Text
                tx={videoInfo.author}
                style={{ marginTop: 2 }}
                numberOfLines={1}
                t3
                color={palette.G4(1)}
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
        <Animated.View
          style={[
            {
              backgroundColor: colors.background,
            },
            styles.sliderTranslate,
          ]}
        />
        <View
          style={[
            styles.flex1,
            {
              backgroundColor: colors.background,
              width,
            },
          ]}>
          <ScrollView contentContainerStyle={styles.flex1}>
            <TouchableHighlight
              underlayColor={dark ? palette.G5(0.6) : palette.G2(0.6)}
              onPress={openModal}>
              <View style={[styles.titleContainer, getDividerStyle()]}>
                <Text
                  h4
                  tx={`${videoInfo.author} - ${videoInfo.title}`}
                  style={styles.title}
                />

                <Icon
                  name="a-ic_chevrondown_16"
                  size={16}
                  color={colors.text}
                />
              </View>
            </TouchableHighlight>
            <View style={[flexRow, styles.authors, getDividerStyle()]}>
              <View style={flexRow}>
                <Avatar size={40} style={mr(3)} />
                <View>
                  <Text tx={videoInfo.author} t1 />
                  <Text>
                    <Text
                      tx={'44.7M '}
                      t4
                      color={dark ? palette.G3(1) : palette.G5(1)}
                    />
                    <Text
                      tx={'subscribers'}
                      t5
                      color={dark ? palette.G3(1) : palette.G5(1)}
                    />
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  tx={'SUBSCRIBED'}
                  h5
                  color={dark ? palette.G3(1) : palette.G5(1)}
                />
              </View>
            </View>
          </ScrollView>
          <BottomSheetModal
            ref={descModalRef}
            index={indexDesc.current}
            snapPoints={[fullViewHeight, height - insets.top]}
            backdropComponent={renderBackdrop}
            animatedIndex={indexValue}
            backgroundStyle={{ backgroundColor: colors.background }}
            onChange={onSheetChange}
            onDismiss={() => {
              isOpened.current = false;
            }}
            handleComponent={handleComponent}>
            <BottomSheetScrollView
              contentContainerStyle={[
                styles.desc,
                {
                  paddingBottom: insets.bottom + 44,
                  backgroundColor: colors.background,
                },
              ]}>
              <Text tx={videoInfo.title} t3 tBold style={mt(3)} />

              <View style={[styles.descInfo, getDividerStyle()]}>
                <Avatar size={20} style={styles.avatar} />
                <Text tx={videoInfo.author} t3 tBold />
              </View>
              <Text tx={videoInfo.desc} h4 style={[mt(3), mb(3)]} />
            </BottomSheetScrollView>
          </BottomSheetModal>

          <BottomSheetModal
            ref={optionsModalRef}
            index={indexOptions.current}
            snapPoints={[210]}
            backdropComponent={renderOptionsBackdrop}
            backgroundStyle={[
              styles.backgroundStyle,
              { backgroundColor: colors.background },
            ]}
            footerComponent={() => (
              <InkWell
                onTap={() => {
                  optionsModalRef.current?.close();
                }}
                contentContainerStyle={[styles.inkWell, mt(1)]}
                style={[
                  styles.inkWellView,
                  {
                    marginBottom: insets.bottom + 10,
                    borderTopColor: colors.border,
                    borderTopWidth: px2dp(0.5),
                  },
                ]}>
                <View style={[styles.item]}>
                  <Icon name="close" size={24} color={colors.text} />
                  <Text tx={'Cancel'} style={styles.text} t2 />
                </View>
              </InkWell>
            )}
            handleComponent={() => null}>
            <BottomSheetScrollView>
              {options.map(item => (
                <InkWell
                  onTap={() => {
                    optionsModalRef.current?.close();
                  }}
                  contentContainerStyle={styles.inkWell}
                  style={styles.inkWellView}
                  key={item.title}>
                  <View style={styles.item}>
                    <Icon name={item.icon} size={24} color={colors.text} />
                    <Text
                      tx={item.title}
                      t2
                      style={styles.text}
                      color={colors.text}
                    />
                  </View>
                </InkWell>
              ))}
            </BottomSheetScrollView>
          </BottomSheetModal>
          <Animated.View
            pointerEvents={snapPoint === SNAP_POINT[0] ? 'none' : 'auto'}
            style={[
              styles.backdrop,
              { backgroundColor: colors.background },
              getBackdropStyle,
            ]}
          />
        </View>
      </Animated.View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    minHeight: height,
  },
  backgroundStyle: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  authors: {
    justifyContent: 'space-between',
    marginTop: 12,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  avatar: {
    marginRight: 6,
  },
  boards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  container: {
    backgroundColor: palette.transparent,
    flex: 1,
    paddingBottom: 20,
    paddingTop: 20,
  },
  desc: {
    paddingHorizontal: 20,
  },
  descInfo: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    paddingBottom: 12,
  },
  full: {
    backgroundColor: palette.B(1),
    flex: 1,
  },
  handleTitle: {
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeader: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  options: {
    justifyContent: 'space-between',
    marginTop: 32,
  },

  title: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  view: {
    backgroundColor: palette.B(1),
    flex: 1,
  },
  pageView: {
    flex: 1,
    width: '100%',
    position: 'absolute',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    marginTop: -sliderTranslateY,
  },
  header: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width,
  },
  block: {
    borderRadius: 2,
    height: 3,
    width: 40,
  },
  item: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 20,
  },
  inkWell: {
    justifyContent: 'center',
  },
  inkWellFooter: {
    width: '100%',
  },
  inkWellView: {
    width: '100%',
    height: 40,
  },
  snapshot: {
    width: 120,
    height: 67,
  },
  sliderTranslate: {
    height: sliderTranslateY,
    marginTop: -sliderTranslateY,
    zIndex: -1,
    elevation: -1,
  },
});
