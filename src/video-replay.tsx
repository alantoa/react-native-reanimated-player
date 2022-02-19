import React from 'react';
import { Button, View, ViewStyle } from 'react-native';

type Props = {
  isPlayed: boolean;
  onPress: () => void;
};
/**
 * Show replay btn
 */
const STYLE: ViewStyle = {
  alignItems: 'center',
  alignSelf: 'center',
  elevation: 1,
  justifyContent: 'center',
  position: 'absolute',
  top: '50%',
  zIndex: 1,
};
export const VideoReplayed = React.memo<Props>(function VideoReplayed({
  isPlayed,
  onPress,
}) {
  if (!isPlayed) return null;
  return (
    <View style={STYLE}>
      <Button onPress={onPress} title={`replay`} />
    </View>
  );
});
