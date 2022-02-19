import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './components';
import { palette } from './theme/palette';

type Props = {
  isError: boolean;
};

export const VideoError = React.memo<Props>(function VideoError({ isError }) {
  if (!isError) return null;
  return (
    <View style={errorStyle.container}>
      <Text h5 color={palette.Danger(1)} tx="error" />
    </View>
  );
});
const errorStyle = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.G7(0.5),
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
});
