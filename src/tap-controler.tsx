import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  TapGestureHandler,
  TapGestureHandlerProps,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const hitSlop = { left: 8, bottom: 4, right: 8, top: 4 };

type TapControlerProps = TapGestureHandlerProps & {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const TapControler: React.FC<TapControlerProps> = ({
  onPress,
  style,
  children,

  ...rest
}) => {
  return (
    <TapGestureHandler {...rest} onActivated={onPress}>
      <Animated.View hitSlop={hitSlop} style={style}>
        {children}
      </Animated.View>
    </TapGestureHandler>
  );
};
