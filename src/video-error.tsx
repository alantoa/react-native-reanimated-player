import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from './theme/palette';

type ErrorProps = {
  isError: boolean;
};
export const VideoError = ({ isError }: ErrorProps) => {
  if (!isError) return null;
  if (isError) {
    return (
      <View style={errorStyle.container}>
        <Text style={errorStyle.text}>加载错误</Text>
      </View>
    );
  }
};
const errorStyle = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.G7(0.5),
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  text: {
    color: palette.Danger(1),
  },
});
