import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { GestureDetector } from 'react-native-gesture-handler';

import Animated from 'react-native-reanimated';

const hitSlop = { left: 8, bottom: 4, right: 8, top: 4 };

type TapControlerProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const TapControler: React.FC<TapControlerProps> = ({
  onPress,
  style,
  children,
}) => {
  const gesture = Gesture.Tap().onEnd((_e, success) => {
    if (success) {
      onPress();
    }
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View hitSlop={hitSlop} style={style}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
