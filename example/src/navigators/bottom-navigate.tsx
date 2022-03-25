import { Portal } from '@gorhom/portal';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import React, { useContext } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import { clamp } from 'react-native-awesome-slider/src/utils';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../../src/theme/palette';
import { height, width } from '../../src/utils';
import { Text } from '../components';
import { Icon } from '../components/icon';
import { Context } from '../context';
import { Example } from '../screens';

export type RootParamList = {
  Example: undefined;
};

const BottomTab = createBottomTabNavigator();

const getViewStyle = (color: string) => ({
  flex: 1,
  backgroundColor: color,
});

const RootTab2 = () => {
  return <View style={getViewStyle(`rgba(0, 99, 247, 1)`)} />;
};
const RootTab3 = () => {
  return <View style={getViewStyle(`rgba(255, 61, 74, 1)`)} />;
};
const RootTab4 = () => {
  return <View style={getViewStyle(`rgba(255, 187, 0, 1)`)} />;
};

const BOTTOM_VIEW: ViewStyle = {
  justifyContent: 'center',
  paddingTop: 4,
  flexDirection: 'row',
  width: width,
  borderTopWidth: 0.5,
  position: 'absolute',
  bottom: 0,
};
const BOTTOM_TAB: ViewStyle = {
  flex: 1,
  alignItems: 'center',
};
const BOTTOM_TEXT: TextStyle = { marginTop: 2 };
const BOTTOM_TAB_HEIGHT = 48.5;
const BottomTabNavigator = () => {
  const { colors } = useTheme();

  const insets = useSafeAreaInsets();
  const { videoTranslateY } = useContext(Context);

  const getBottomtabStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      videoTranslateY.value,
      [0, height - insets.bottom - BOTTOM_TAB_HEIGHT - 120],
      [insets.bottom + BOTTOM_TAB_HEIGHT, 0],
    );

    return {
      transform: [
        {
          translateY: clamp(translateY, 0, 80),
        },
      ],
    };
  });

  const renderTabBar = ({
    state,
    descriptors,
    navigation,
  }: BottomTabBarProps) => {
    return (
      <Portal>
        <Animated.View
          style={[
            {
              height: BOTTOM_TAB_HEIGHT + insets.bottom,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
              paddingBottom: insets.bottom,
              ...BOTTOM_VIEW,
            },
            getBottomtabStyle,
          ]}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = async () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                if (route.name === 'add') {
                  return;
                }
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };
            const textColor = isFocused ? colors.text : palette.G4(1);
            const iconColor = isFocused ? '' : palette.G3(1);
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={BOTTOM_TAB}
                key={route.key}>
                {options.tabBarButton ? (
                  options.tabBarButton({ children: null })
                ) : (
                  <>
                    {
                      // @ts-ignore
                      options?.tabBarIcon({
                        focused: isFocused,
                        color: iconColor,
                        size: 24,
                      })
                    }
                    <Text
                      style={{
                        color: textColor,
                        ...BOTTOM_TEXT,
                      }}
                      t5
                      tx={label.toString()}
                    />
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Portal>
    );
  };
  return (
    <BottomTab.Navigator
      initialRouteName="home"
      sceneContainerStyle={{ backgroundColor: palette.G1(1) }}
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}>
      <BottomTab.Screen
        name={'home'}
        component={Example}
        options={() => ({
          tabBarLabel: 'Home',
          tabBarIcon: props => (
            <Icon name={'home'} {...props} color={colors.text} />
          ),
        })}
      />
      <BottomTab.Screen
        name={'shorts'}
        component={RootTab2}
        options={() => ({
          tabBarLabel: 'Shorts',
          tabBarIcon: props => (
            <Icon name={'youtube-shorts'} {...props} color={colors.text} />
          ),
        })}
      />
      <BottomTab.Screen
        name="add"
        options={{
          tabBarButton: () => <Icon name="add" size={40} color={colors.text} />,
        }}>
        {() => <></>}
      </BottomTab.Screen>
      <BottomTab.Screen
        name={'subscriptions'}
        component={RootTab3}
        options={() => ({
          tabBarLabel: 'Subscriptions',
          tabBarIcon: props => (
            <Icon name={'subscriptions'} {...props} color={colors.text} />
          ),
        })}
      />
      <BottomTab.Screen
        name={'library'}
        component={RootTab4}
        options={() => ({
          tabBarLabel: 'Library',
          tabBarIcon: props => (
            <Icon name={'video_library'} {...props} color={colors.text} />
          ),
        })}
      />
    </BottomTab.Navigator>
  );
};
export default BottomTabNavigator;
