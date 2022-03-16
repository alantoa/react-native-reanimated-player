import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useRef } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageStyle,
  PixelRatio,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  TouchableHighlight,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import VideoPlayer, { VideoPlayerRef } from '../../../src';
import type { RootParamList } from '../../App';
import { Text, ThemeView } from '../components';
import { Icon } from '../components/icon';
import IconFont from '../components/iconfont';
import { palette } from '../theme/palette';
const px2dp = (px: number) => PixelRatio.roundToNearestPixel(px);
export const { width, height, scale, fontScale } = Dimensions.get('window');
const VIDEO_DEFAULT_HEIGHT = width * (9 / 16);
const videoInfo = {
  title: 'Billie Eilish - Bad Guy - When We All Fall Asleep, Where Do We Go?',
  author: 'Billie Eilish',
  avatar: require('../assets/avatar.jpeg'),
  source: require('../assets/video-demo.mp4'),
  desc: `A react native video player components demo, this is desc`,
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

export const Example = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const descModalRef = useRef<BottomSheetModal>(null);
  const optionsModalRef = useRef<BottomSheetModal>(null);
  const fullViewHeight = height - VIDEO_DEFAULT_HEIGHT - insets.top - 2;
  const indexDesc = useRef(0);
  const indexOptions = useRef(0);

  const isOpened = useRef(false);

  const indexValue = useSharedValue(0);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const onOpen = () => {
    isOpened.current = true;
    descModalRef.current?.present();
  };
  const renderBackdrop = useCallback(props => {
    const getHeaderBackdropStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(indexValue.value, { duration: 100 }),
      };
    });
    const getBodyBackdropStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(1 + indexValue.value, { duration: 100 }),
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
    if (!isOpened.current) return;
    switch (index) {
      case 1:
        videoPlayerRef.current?.setPause();
        break;
      case 0:
        videoPlayerRef.current?.setPlay();
        break;
      default:
        break;
    }
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
  return (
    <BottomSheetModalProvider>
      <SafeAreaView
        style={{
          backgroundColor: palette.B(1),
          flex: 1,
          overflow: 'hidden',
        }}
        edges={['left', 'right']}>
        <VideoPlayer
          source={videoInfo.source}
          playWhenInactive
          posterResizeMode="cover"
          ignoreSilentSwitch="ignore"
          headerBarTitle={videoInfo.title}
          onTapBack={() => {
            Alert.alert('onTapBack');
          }}
          onTapMore={() => {
            optionsModalRef.current?.present();
          }}
          onToggleAutoPlay={(state: boolean) => {
            console.log(`onToggleAutoPlay state: ${state}`);
          }}
          initPaused={true}
          videoDefaultHeight={VIDEO_DEFAULT_HEIGHT}
          ref={videoPlayerRef}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}>
          <ScrollView
            contentContainerStyle={{
              flex: 1,
            }}>
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
                <Avatar size={40} style={{ marginRight: 12 }} />
                <View>
                  <Text tx={videoInfo.author} t1 />
                  <Text>
                    <Text
                      tx={`44.7M `}
                      t4
                      color={dark ? palette.G3(1) : palette.G5(1)}
                    />
                    <Text
                      tx={`subscribers`}
                      t5
                      color={dark ? palette.G3(1) : palette.G5(1)}
                    />
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  tx={`SUBSCRIBED`}
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
              <Text tx={videoInfo.title} t3 tBold style={{ marginTop: 12 }} />

              <View style={[styles.descInfo, getDividerStyle()]}>
                <Avatar size={20} style={styles.avatar} />
                <Text tx={videoInfo.author} t3 tBold />
              </View>
              <Text tx={videoInfo.desc} h4 style={{ marginVertical: 12 }} />
            </BottomSheetScrollView>
          </BottomSheetModal>

          <BottomSheetModal
            ref={optionsModalRef}
            index={indexOptions.current}
            snapPoints={[400]}
            backdropComponent={renderOptionsBackdrop}
            backgroundStyle={{ backgroundColor: colors.background }}
            footerComponent={() => (
              <View
                style={[
                  styles.item,
                  {
                    paddingBottom: insets.bottom + 44,
                    backgroundColor: colors.background,
                  },
                ]}>
                <Text tx={'Cancel'} t3 tBold />
              </View>
            )}
            handleComponent={() => null}>
            <BottomSheetScrollView>
              <View style={styles.item}>
                <Text tx={'Report'} t3 tBold />
              </View>
            </BottomSheetScrollView>
          </BottomSheetModal>
        </View>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
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
    overflow: 'hidden',
    width,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
