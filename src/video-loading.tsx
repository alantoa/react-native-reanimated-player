import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type Props = {
  loading?: boolean;
};
export const VideoLoader = React.memo<Props>(function VideoLoader({ loading }) {
  if (!loading) return null;
  return (
    <View style={loaderStyle.container}>
      <ActivityIndicator size="large" color="white" />
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
