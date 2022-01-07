import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { I18nManager } from 'react-native';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { Slider } from '../../../src/slider/index';
import { RootParamList } from '../../App';

export const Home = () => {
  const navigate = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);

  const onSlidingComplete = (e: number) => {
    // console.log(e);
  };
  const onSlidingStart = () => {
    // console.log('onSlidingStart');
  };
  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#e1e1e1' }}>
        <ScrollView style={{ paddingHorizontal: 20, paddingVertical: 40 }}>
          <StatusBar barStyle={'dark-content'} />
          <Slider
            progress={progress}
            onSlidingComplete={onSlidingComplete}
            onSlidingStart={onSlidingStart}
            minimumValue={min}
            maximumValue={max}
            disable
          />
        </ScrollView>
      </View>
    </>
  );
};
