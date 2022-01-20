import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';
import VideoPlayer from 'react-native-video-player';
import { Text } from './../../src/components';
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
    <SafeAreaView
      style={{ backgroundColor: '#000' }}
      edges={['top', 'left', 'right']}>
      <VideoPlayer
        source={require('../assets/billie-demo.mp4')}
        playWhenInactive
        posterResizeMode="cover"
        ignoreSilentSwitch="ignore"
        headerTitle={'123123'}
        onTapBack={() => {
          navigate.goBack();
        }}
      />
      <ScrollView style={{ backgroundColor: '#fff', padding: 20 }}>
        <View style={{ flex: 1, height: 900 }}>
          <Text>Title</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
