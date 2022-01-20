import {
  GestureEvent,
  TapGestureHandler,
  TapGestureHandlerEventPayload,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import React from 'react';
import type { StyleProp } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { hitSlop } from './constants';
type TapControlerProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const TapControler: React.FC<TapControlerProps> = ({
  onPress,
  style,
  children,
}) => {
  return (
    <TapGestureHandler onActivated={onPress}>
      <Animated.View hitSlop={hitSlop} style={style}>
        {children}
      </Animated.View>
    </TapGestureHandler>
  );
};
