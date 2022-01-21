import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';
import VideoPlayer from 'react-native-video-player';
import { Text } from './../../src/components';
import { width } from '../../../src/utils';
import type { RootParamList } from '../../App';
import { palette } from '../theme/palette';
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
      style={{ backgroundColor: palette.B(1), flex: 1 }}
      edges={['top', 'left', 'right']}>
      <VideoPlayer
        source={require('../assets/video-demo.mp4')}
        playWhenInactive
        posterResizeMode="cover"
        ignoreSilentSwitch="ignore"
        headerTitle={
          'Billie Eilish - Bad Guy - When We All Fall Asleep, Where Do We Go?'
        }
        onTapBack={() => {
          Alert.alert('onTapBack');
        }}
      />
      <View style={{ backgroundColor: palette.G8(1), flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            flex: 1,
          }}>
          <View
            style={{
              borderBottomColor: palette.G6(1),
              borderBottomWidth: 0.5,
              paddingBottom: 8,
            }}>
            <Text
              tx="Billie Eilish - Bad Guy - When We All Fall Asleep, Where Do We Go?"
              h4
              color={palette.G2(1)}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
