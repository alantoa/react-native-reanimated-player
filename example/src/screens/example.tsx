/* eslint-disable react-native/no-inline-styles */
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoPlayer, { VideoPlayerRef } from '../../../src';
import { Text, ThemeView } from '../components';
import { Icon } from '../components/icon';
import type { IconNames } from '../components/iconfont';
import { palette } from '../theme/palette';
import { mb, mr, mt } from '../utils/ui-tools';
const springConfig = {
  mass: 0.5,
  overshootClamping: true,
};
const videos = [
  {
    cover:
      'https://i.ytimg.com/vi/0I647GU3Jsc/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCkhUQfsvuAwRk02D4ogMIc12pR4w',
    title: 'Imagine Dragons - Natural',
    avatar:
      'https://yt3.ggpht.com/aXBmHKABw-J-0ZMxj39wkXpLDEHViOdL5UD71cDG2s5vbeQBWk9mdX3rRxT5U6Wfkvm6o8Uu-dU=s88-c-k-c0x00ffffff-no-rj',
  },
  {
    cover:
      'https://i.ytimg.com/vi/MZuL3kg9Sz4/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBPsyKYqM8TwYHZJFHRmRDJwHazOQ',
    title: 'Taylor Swift - Blank Space live iHeartRadio Jingle Ball 2014/12/12',
    avatar:
      'https://yt3.ggpht.com/MqKm9xyjonzkICKA78ir0AM-WUR47ntkBeJlgHeIk_rUnPuukiWtzOEmU7UjO8cFoPrBatCh3As=s176-c-k-c0x00ffffff-no-rj-mo',
  },
  {
    cover: 'https://i.ytimg.com/vi/ao2i_sOD-z0/hqdefault.jpg',
    title: 'Glassmorphism in React Native',
    avatar:
      'https://yt3.ggpht.com/ytc/AKedOLQ0bZfVzpq_TBL7u-k6dSNRFX3dt2mU-m0_HfO7dg=s68-c-k-c0x00ffffff-no-rj',
  },
  {
    cover:
      'https://i.ytimg.com/vi/Iw5BiCxOR-c/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLB-46lFeaqJ82G4e-sL41iiwkHOMA',
    title: 'Eminem  - Lose Yourself [HD] - Joker',
    avatar:
      'https://yt3.ggpht.com/ytc/AKedOLTl3oEyE5erZSJL6T3AqzFUo2pjsbI2f595a8gvQQ=s48-c-k-c0x00ffffff-no-rj-mo',
  },
];
const px2dp = (px: number) => PixelRatio.roundToNearestPixel(px);
export const { width, height, scale, fontScale } = Dimensions.get('window');
const sliderTranslateY = 10;
const VIDEO_DEFAULT_HEIGHT = width * (9 / 16);
const videoInfo = {
  title: 'Billie Eilish - Bad Guy - When We All Fall Asleep, Where Do We Go?',
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
const SNAP_POINT = [0, height - 200];

const VIDEO_SCALE_HEIGHT = 120;

export const Example = () => {
  const [paused, setPaused] = useState(true);
  const [snapPoint, setSnapPoint] = useState(SNAP_POINT[0]);

  const insets = useSafeAreaInsets();
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

  const pageStyle = useAnimatedStyle(() => {
    const translateY = panTranslationY.value + sheetTranslationY.value;
    panTranslationY.value;
    return {
      transform: [
        {
          translateY: clamp(translateY, 0, height - insets.bottom - 48),
        },
      ],
      backgroundColor: isFullScreen.value ? '#000' : 'transparent',
    };
  });
  const getFullScreenStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: isFullScreen.value ? '#000' : colors.background,
    };
  });
  const customAnimationStyle = useAnimatedStyle(() => {
    const translateY = panTranslationY.value + sheetTranslationY.value;
    const targetHeight = videoHeight.value * ((height - translateY) / height);

    let targetWidth = videoWidth.value;

    if (targetHeight < VIDEO_SCALE_HEIGHT) {
      const widthScale = clamp((height - translateY) / translateY, 0, 1);
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
  });
  const getHeaderBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: indexValue.value,
    };
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getBodyBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 + indexValue.value,
    };
  });
  const getBackdropStyle = useAnimatedStyle(() => {
    const translateY = panTranslationY.value + sheetTranslationY.value;
    return {
      opacity: interpolate(
        translateY,
        [VIDEO_SCALE_HEIGHT, height - VIDEO_DEFAULT_HEIGHT],
        [0, 1],
      ),
    };
  }, [panTranslationY, sheetTranslationY]);

  const getViewBackdropStyle = useAnimatedStyle(() => {
    const translateY = panTranslationY.value + sheetTranslationY.value;
    return {
      opacity: interpolate(
        translateY,
        [-100, height - VIDEO_DEFAULT_HEIGHT],
        [1, 0],
      ),
    };
  }, [panTranslationY, sheetTranslationY]);

  const videoThumbInfo = useAnimatedStyle(() => {
    return {
      opacity: isFullScreen.value ? 0 : 1,
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
        <Text
          tx={videoInfo.createTime}
          t3
          color={dark ? palette.W(1) : palette.G9(1)}
        />
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
  const panGesture = Gesture.Pan()
    .onStart(({ velocityY, velocityX }) => {
      panIsVertical.value = Math.abs(velocityY) > Math.abs(velocityX);
      videoPlayerRef.current?.toggleControlViewOpacity(false);
      runOnJS(seek)();
      runOnJS(closeDescModal)();
    })
    .onUpdate(({ translationY }) => {
      if (!panIsVertical.value) {
        return;
      }
      panTranslationY.value = translationY;
    })
    .onEnd(({ velocityY }, success) => {
      const dragToss = 0.1;
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
          destSnapPoint = point;
        }
      }
      const finalSheetValue = sheetTranslationY.value + panTranslationY.value;
      sheetTranslationY.value = finalSheetValue;
      panTranslationY.value = 0;
      sheetTranslationY.value = withSpring(destSnapPoint, springConfig);
      runOnJS(onHandlerEndOnJS)(destSnapPoint);
    });
  const unfoldVideo = () => {
    sheetTranslationY.value = withSpring(SNAP_POINT[0], springConfig);
  };
  const foldVideo = () => {
    sheetTranslationY.value = withSpring(
      SNAP_POINT[SNAP_POINT.length - 1],
      springConfig,
    );
  };
  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1, backgroundColor: palette.B(1) }}>
        <ScrollView
          style={{
            marginTop: insets.top,
            flex: 1,
            backgroundColor: colors.background,
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
          {videos.map((item, i) => (
            <TouchableHighlight
              onPress={unfoldVideo}
              underlayColor={dark ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.2)'}
              key={`${i}`}>
              <View style={{ paddingBottom: 12 }}>
                <Image
                  source={{ uri: item.cover }}
                  style={{ width, height: (width * 9) / 16 }}
                />
                <View
                  style={[flexRow, { marginTop: 8, paddingHorizontal: 20 }]}>
                  <Image
                    source={{ uri: item.avatar }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 40,
                      marginRight: 8,
                    }}
                  />
                  <Text
                    h5
                    tx={item.title}
                    color={colors.text}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </TouchableHighlight>
          ))}
        </ScrollView>
        <Animated.View
          pointerEvents={'none'}
          style={[
            styles.backdrop,
            { backgroundColor: palette.B(1) },
            getViewBackdropStyle,
          ]}
        />
      </View>

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
              getFullScreenStyle,
            ]}>
            <VideoPlayer
              source={videoInfo.source}
              playWhenInactive
              posterResizeMode="cover"
              ignoreSilentSwitch="ignore"
              headerBarTitle={videoInfo.title}
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
                disable: snapPoint > SNAP_POINT[0],
              }}
              videoHeight={videoHeight}
              customAnimationStyle={customAnimationStyle}
              onCustomPanGesture={panGesture}
              style={{ marginBottom: sliderTranslateY }}
              resizeMode="cover"
              isFullScreen={isFullScreen}
            />
            <Animated.View
              style={[
                { marginBottom: 20, flex: 1, marginLeft: 12, marginRight: 20 },
                videoThumbInfo,
              ]}>
              <Text
                tx={videoInfo.title}
                numberOfLines={1}
                color={colors.text}
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
                <Text h4 tx={videoInfo?.title} style={styles.title} />
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
    top: 0,
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
