import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootParamList } from '../../App';

export const Home = () => {
  const navigate = useNavigation<NativeStackNavigationProp<RootParamList>>();

  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#e1e1e1' }}>
        <ScrollView style={{ padding: 20 }}>
          <StatusBar barStyle={'dark-content'} />
          <TouchableOpacity
            style={{ padding: 20 }}
            onPress={() => navigate.navigate('lightbox')}>
            <Text>Example1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ padding: 20 }}
            onPress={() => navigate.navigate('example2')}>
            <Text>Example2</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};
