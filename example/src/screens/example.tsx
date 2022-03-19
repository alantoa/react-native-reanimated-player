import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { useState } from 'react';
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { mb, mr, mt } from '../utils/ui-tools';
import VideoPlayer, { VideoPlayerRef, VideoProps } from '../../../src';
import { Text, ThemeView } from '../components';
import { Icon } from '../components/icon';
import type { IconNames } from '../components/iconfont';
import { palette } from '../theme/palette';
import InkWell from 'react-native-inkwell';
import { clamp } from 'react-native-awesome-slider/src/utils';
const px2dp = (px: number) => PixelRatio.roundToNearestPixel(px);
export const { width, height, scale, fontScale } = Dimensions.get('window');
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

export const Example = () => {
  const [paused, setPaused] = useState(true);
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const descModalRef = useRef<BottomSheetModal>(null);
  const optionsModalRef = useRef<BottomSheetModal>(null);
  const fullViewHeight = height - VIDEO_DEFAULT_HEIGHT - insets.top - 2;
  const indexDesc = useRef(0);
  const indexOptions = useRef(0);
  const isOpened = useRef(false);
  const isTapPaused = useRef(paused);
  const sheetPrevIndex = useRef(-1);
  const indexValue = useSharedValue(0);
  const panTranslationY = useSharedValue(0);
  const panVelocityY = useSharedValue(0);

  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const videoHeight = useSharedValue(VIDEO_DEFAULT_HEIGHT);
  const pageStyle = useAnimatedStyle(() => {
    // console.log(panTranslationY.value, panVelocityY.value);

    return {
      transform: [
        {
          translateY: clamp(panTranslationY.value, 0, height),
        },
      ],
    };
  });

  const customContainerAnimationStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: clamp(panTranslationY.value, 0, height),
        },
      ],
      height: videoHeight.value,
    };
  }, []);
  const onOpen = () => {
    descModalRef.current?.present();
  };
  const renderBackdrop = useCallback(props => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.view} edges={['left', 'right']}>
        <Animated.View style={[styles.pageView, pageStyle]}>
          <VideoPlayer
            source={videoInfo.source}
            playWhenInactive
            posterResizeMode="cover"
            ignoreSilentSwitch="ignore"
            headerBarTitle={videoInfo.title}
            onTapBack={() => {
              // Alert.alert('onTapBack');
            }}
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
            }}
            panTranslationY={panTranslationY}
            panVelocityY={panVelocityY}
            videoHeight={videoHeight}
            customContainerAnimationStyle={customContainerAnimationStyle}
          />
          <View
            style={[
              styles.flex1,
              {
                backgroundColor: colors.background,
              },
            ]}>
            <ScrollView contentContainerStyle={styles.flex1}>
              <TouchableHighlight
                underlayColor={dark ? palette.G5(0.6) : palette.G2(0.6)}
                onPress={onOpen}>
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
          </View>
        </Animated.View>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
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
    paddingTop: 20,
    paddingBottom: 8,
  },
  view: {
    backgroundColor: palette.B(1),
    flex: 1,
  },
  pageView: {
    flex: 1,
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
});
