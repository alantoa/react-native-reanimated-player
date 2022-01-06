import React from "react"
import { StyleSheet, View } from "react-native"
import Spinner from "react-native-spinkit"
import { palette } from "../../theme/palette"

export const VideoLoader = ({ loading }) => {
  if (!loading) return null
  return (
    <View style={loaderStyle.container}>
      <Spinner type="ChasingDots" color={palette.Main(1)} />
    </View>
  )
}
const loaderStyle = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    ...StyleSheet.absoluteFillObject,
  },
})
