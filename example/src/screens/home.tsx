import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoPlayer from 'react-native-video-player';
import { width } from '../../../src/utils';
import type { RootParamList } from '../../App';
export const Home = () => {
  const navigate = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(0);
  const cache = useSharedValue(80);
  const disable = useSharedValue(false);
  const isScrubbing = useRef(false);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const timer = setInterval(() => {
      progress.value++;
      cache.value = cache.value + 1.5;
    }, 1000);
    return () => clearTimeout(timer);
  }, [isScrubbing.current]);

  return (
    <>
      <VideoPlayer
        source={{
          uri: 'https://42how-com.oss-cn-beijing.aliyuncs.com/v/%E8%A7%86%E9%A2%91%E7%B4%A0%E6%9D%90/NIO%20Day%204K(1).mp4',
        }}
        playWhenInactive
        posterResizeMode="cover"
        ignoreSilentSwitch="ignore"
        headerTop={0}
      />
      <ScrollView>
        <View style={{ height: width * (9 / 16), width: width }} />
      </ScrollView>
    </>
  );
};
