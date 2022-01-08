import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { I18nManager } from 'react-native';
import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { Slider } from '../../../src/slider/index';
import { RootParamList } from '../../App';
import { Text } from '../components';
export const Home = () => {
  const navigate = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  const isScrubbing = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => {
      progress.value++;
    }, 1000);
    return () => clearTimeout(timer);
  }, [isScrubbing.current]);
  const onSlidingComplete = (e: number) => {
    console.log('onSlidingComplete');
    isScrubbing.current = false;
  };
  const onSlidingStart = () => {
    console.log('onSlidingStart');
    isScrubbing.current = true;
  };
  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#e1e1e1' }}>
        <ScrollView style={{ paddingHorizontal: 20, paddingVertical: 40 }}>
          <StatusBar barStyle={'dark-content'} />
          <View>
            <Text tx="Slider simple" h2 />
          </View>
          <Slider
            progress={progress}
            onSlidingComplete={onSlidingComplete}
            onSlidingStart={onSlidingStart}
            minimumValue={min}
            maximumValue={max}
          />
        </ScrollView>
      </View>
    </>
  );
};
