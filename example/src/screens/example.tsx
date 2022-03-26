/* eslint-disable react-native/no-inline-styles */
import { useTheme } from '@react-navigation/native';
import React, { useContext } from 'react';
import { Image, ScrollView, TouchableHighlight, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components';
import { PlayerContext } from '../state/context';
import { setPlayerPoint } from '../state/reducer';
import { palette } from '../theme/palette';
import { width } from '../utils';
const videos = [
  {
    cover:
      'https://i.ytimg.com/vi/0I647GU3Jsc/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCkhUQfsvuAwRk02D4ogMIc12pR4w',
    title: 'Natural',
    author: 'Imagine Dragons',
    pv: '323k',
    avatar:
      'https://yt3.ggpht.com/aXBmHKABw-J-0ZMxj39wkXpLDEHViOdL5UD71cDG2s5vbeQBWk9mdX3rRxT5U6Wfkvm6o8Uu-dU=s88-c-k-c0x00ffffff-no-rj',
  },
  {
    cover:
      'https://i.ytimg.com/vi/MZuL3kg9Sz4/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBPsyKYqM8TwYHZJFHRmRDJwHazOQ',
    title: 'Blank Space live iHeartRadio Jingle Ball 2014/12/12',
    author: 'Taylor Swift',
    pv: '480k',
    avatar:
      'https://yt3.ggpht.com/MqKm9xyjonzkICKA78ir0AM-WUR47ntkBeJlgHeIk_rUnPuukiWtzOEmU7UjO8cFoPrBatCh3As=s176-c-k-c0x00ffffff-no-rj-mo',
  },
  {
    cover: 'https://i.ytimg.com/vi/ao2i_sOD-z0/hqdefault.jpg',
    title: 'Glassmorphism in React Native',
    author: 'Taylor Swift',
    pv: '30k',
    avatar:
      'https://yt3.ggpht.com/ytc/AKedOLQ0bZfVzpq_TBL7u-k6dSNRFX3dt2mU-m0_HfO7dg=s68-c-k-c0x00ffffff-no-rj',
  },
  {
    cover:
      'https://i.ytimg.com/vi/Iw5BiCxOR-c/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLB-46lFeaqJ82G4e-sL41iiwkHOMA',
    title: 'Lose Yourself [HD] - Joker',
    author: 'Eminem',
    pv: '40k',
    avatar:
      'https://yt3.ggpht.com/ytc/AKedOLTl3oEyE5erZSJL6T3AqzFUo2pjsbI2f595a8gvQQ=s48-c-k-c0x00ffffff-no-rj-mo',
  },
];
export const Example = () => {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { dispatch } = useContext(PlayerContext);
  const onPress = () => {
    dispatch(setPlayerPoint(0));
  };
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
            onPress={onPress}
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
                <View style={{ flex: 1 }}>
                  <Text
                    h5
                    tx={item.title}
                    color={colors.text}
                    style={{ flex: 1 }}
                    numberOfLines={1}
                  />
                  <Text
                    t3
                    tx={`${item.author} · ${item.pv} views`}
                    color={palette.G4(1)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          </TouchableHighlight>
        ))}
      </ScrollView>
    </View>
  );
};
