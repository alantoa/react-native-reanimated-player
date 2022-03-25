/* eslint-disable react-native/no-inline-styles */
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, TouchableHighlight, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components';
import { palette } from '../theme/palette';
import { width } from '../utils';
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
export const Example = () => {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
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
            onPress={() => false}
            underlayColor={dark ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.2)'}
            key={`${i}`}>
            <View style={{ paddingBottom: 12 }}>
              <Image
                source={{ uri: item.cover }}
                style={{ width, height: (width * 9) / 16 }}
              />
              <View
                style={{
                  marginTop: 8,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
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
    </View>
  );
};
