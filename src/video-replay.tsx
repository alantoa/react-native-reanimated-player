import React from "react"
import { View, ViewStyle } from "react-native"
import { Button } from "../index"
/**
 * Show replay btn
 */
const STYLE: ViewStyle = {
  alignItems: "center",
  alignSelf: "center",
  elevation: 1,
  justifyContent: "center",
  position: "absolute",
  top: "50%",
  zIndex: 1,
}
export const VideoReplayed = ({ isPlayed, onPress }) => {
  if (!isPlayed) return null
  return (
    <View style={STYLE}>
      <Button onPress={onPress} title={`重新播放`} size="sm" />
    </View>
  )
}
