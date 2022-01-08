import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { TextInput, TextStyle, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { palette } from '../theme/palette';

const BUBBLE_WIDTH = 100;
const BUBBLE_STYLE: ViewStyle = {
  padding: 2,
  paddingHorizontal: 4,
  borderRadius: 5,
};

export type BallonProps = {
  /**
   * background color of the ballon
   */
  color?: string;

  /**
   * the style for the container view
   */
  containerStyle?: ViewStyle;

  /**
   * the style for the TextInput inside ballon
   */
  textStyle?: TextStyle;

  bubbleMaxWidth?: number;
};
/**
 * a component to show text inside a ballon
 */
export type BallonRef = {
  setText: (text: string) => void;
};
export const Ballon = forwardRef<BallonRef, BallonProps>(
  (
    {
      containerStyle,
      color = palette.Main(1),
      textStyle,
      bubbleMaxWidth = BUBBLE_WIDTH,
    },
    ref,
  ) => {
    const textRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      setText: (text: string) => {
        textRef.current?.setNativeProps({ text });
      },
    }));
    return (
      <Animated.View style={[containerStyle, { alignItems: 'center' }]}>
        <Animated.View
          style={{
            ...BUBBLE_STYLE,
            backgroundColor: color,
            maxWidth: bubbleMaxWidth,
          }}>
          <TextInput
            ref={textRef}
            style={[{ color: palette.W(1), fontSize: 12 }, textStyle]}
          />
        </Animated.View>
        <View
          style={{
            width: 10,
            height: 10,
            borderWidth: 5,
            borderColor: 'transparent',
            borderTopColor: color,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}
        />
      </Animated.View>
    );
  },
);
