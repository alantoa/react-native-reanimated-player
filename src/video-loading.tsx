import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './components';
import { palette } from './theme/palette';

type Props = {
  loading?: boolean;
};
export const VideoLoader = React.memo<Props>(function VideoLoader({ loading }) {
  if (!loading) return null;
  return (
    <View style={loaderStyle.container}>
      <Text h5 color={palette.G1(1)} tx="loading" />
    </View>
  );
});
const loaderStyle = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
});
