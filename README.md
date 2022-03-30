<div align="center">
  <blockquote><i>`JSThread` to `JSThread`, `UIThread` to `UIThread`.</i></blockquote>
  <h1 align="center">React Native Reanimated Player</h1>

[![Reanimated v2 version](https://img.shields.io/github/package-json/v/alantoa/react-native-reanimated-player/master?label=Reanimated%20v2&style=flat-square)](https://www.npmjs.com/package/react-native-reanimated-player) [![npm](https://img.shields.io/npm/l/react-native-reanimated-player?style=flat-square)](https://www.npmjs.com/package/react-native-reanimated-player) [![npm](https://img.shields.io/badge/types-included-blue?style=flat-square)](https://www.npmjs.com/package/react-native-reanimated-player) [![runs with expo](https://img.shields.io/badge/Runs%20with%20Expo-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.io/)

  <h3 align="center">100% written in Typescript video player component, interaction is like Youtube player.</h3>
</div>

<div align="center">
  <table style='width:100%;'>
    <tr>
      <td><h4 align='center'>Player basic usage</h4></td>
      <td><h4 align='center'><a href="https://github.com/alantoa/react-native-reanimated-player/tree/main/example" >▶️ Custom usage for example</a></h4></td>
    </tr>
    <tr>
      <td><img width="260" height="480" src="./assets/example.gif" alt="basic usage"></td>
      <td><img width="260" height="480" src="./assets/example2.gif" alt="Custom usage"></td>
    </tr>
  </table>
</div>
<h4 align='center'><a href="https://twitter.com/alan_toa/status/1507732889181786118" >▶️ Watch example video</a></h4>

## Installation

First you have to follow installation instructions of:

- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [react-native-gesture-handler v2 or v1](https://docs.swmansion.com/react-native-gesture-handler/)
- [react-native-orientation-locker](https://github.com/wonday/react-native-orientation-locker/)
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)
- [react-native-video](https://github.com/react-native-video/react-native-video)

If `react-native-gesture-handler` version >= 2:

```sh
yarn add react-native-reanimated-player@2
```

else use v1:

```sh
yarn add react-native-reanimated-player@1
```

## Example usage

```jsx
import VideoPlayer from 'react-native-reanimated-player';
import { useSharedValue } from 'react-native-reanimated';
export const Example = () => {
  const videoHeight = useSharedValue(0);
  const isFullScreen = useSharedValue(false);
  const { paused, setPaused } = useContext(false);

  return (
    <VideoPlayer
      source={uri}
      headerTitle={'Title in full screen mode'}
      onTapBack={() => {
        Alert.alert('onTapBack');
      }}
      onTapMore={() => {
        Alert.alert('onTapMore');
      }}
      onPausedChange={state => {
        Alert.alert(`onPausedChange: ${state}`);
        setPaused(state);
      }}
      videoHeight={videoHeight}
      paused={paused}
      isFullScreen={isFullScreen}
    />
  );
};
```

## Features

- 100% written in `TypeScript`.
- 100% built upon `react-native-reanimated` and `react-native-gusture-handler`.
- Support gestures switch full screen.
- Support double tap seek to back or ahead.
- ...

## TODO list

- Add more custom props
- Add Previous & Next button
- ~Rewrite the gesture section with react-native-gusture-handle V2~
- Add `expo-av` support
- ...and more

## Configuration

The `<VideoPlayer/>` component has the following configuration properties:

<table>
  <tr>
    <td>Name</td>
    <td>Type</td>
    <td>Description</td>
    <td>Required</td>
    <td>Default Value</td>
  </tr>
  <tr>
    <td>theme</td>
    <td>object</td>
    <td>The slider theme color</td>
    <td>❌</td>
    <td>
      {
        // Color to fill the progress in the seekbar
        minimumTrackTintColor: string,
        // Color to fill the background in the seekbar
        maximumTrackTintColor: string,
        // Color to fill the cache in the seekbar
        cacheTrackTintColor: string,
        // Color to fill the bubble backgroundColor
        disableMinTrackTintColor: string,
        // Disabled color to fill the progress in the seekbar
        bubbleBackgroundColor: string
      }
    </td>
  </tr>
  <tr>
    <td>showOnStart</td>
    <td>boolean</td>
    <td>control view init show</td>
    <td>❌</td>
    <td>false</td>
  </tr>
  <tr>
    <td>onEnterFullscreen</td>
    <td>function</td>
    <td>on enter fullscreen callback</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>onExitFullscreen</td>
    <td>function</td>
    <td>on exit fullscreen callback</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>controlTimeout</td>
    <td>nubmer</td>
    <td>How long to hide the control view after showing</td>
    <td>❌</td>
    <td>2000</td>
  </tr>
  <tr>
    <td>videoDefaultHeight</td>
    <td>number</td>
    <td>video default height</td>
    <td>❌</td>
    <td>screenWidth * (9 / 16)</td>
  </tr>
  <tr>
    <td>headerBarTitle</td>
    <td>string</td>
    <td>header bar title on fullscreen mode</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>onTapBack</td>
    <td>function</td>
    <td>tap header bar Icon-'Back' callback</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>navigation</td>
    <td>any</td>
    <td>navigation</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>autoPlay</td>
    <td>boolean</td>
    <td>auto play</td>
    <td>❌</td>
    <td>false</td>
  </tr>
  <tr>
    <td>onToggleAutoPlay</td>
    <td>function</td>
    <td>on toggle auto play</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>onTapMore</td>
    <td>function</td>
    <td>tap headerbar Icon-'More' callback</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
    <tr>
    <td>doubleTapInterval</td>
    <td>number</td>
    <td>double tap interval</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
   <tr>
    <td>paused</td>
    <td>boolean</td>
    <td>video paused</td>
    <td>✅</td>
    <td>undefined</td>
  </tr>
   <tr>
    <td>onPausedChange</td>
    <td>boolean</td>
    <td>on change video paused</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
   <tr>
    <td>onTapPause</td>
    <td>function</td>
    <td>on tap video paused</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>sliderProps</td>
    <td>object</td>
    <td><a href="https://github.com/alantoa/react-native-awesome-slider/" >react-native-awesome-slider</a> props</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>

   <tr>
    <td>videoHeight</td>
    <td>Animated.SharedValue</td>
    <td>video height</td>
    <td>✅</td>
    <td> width * (9 / 16);</td>
  </tr>
    <tr>
    <td>customAnimationStyle</td>
    <td>Animated Viewstyle</td>
    <td>video height</td>
    <td>❌</td>
    <td>width * (9 / 16);</td>
  </tr>
    <tr>
    <td>onCustomPanGesture</td>
    <td>PanGesture</td>
    <td>custom pan gesture</td>
    <td>❌</td>
    <td>width * (9 / 16);</td>
  </tr>
   <tr>
    <td>isFullScreen</td>
    <td>Animated ShareValue</td>
    <td>fullScreen status</td>
    <td>✅</td>
    <td>undefined</td>
  </tr>
   <tr>
    <td>disableControl</td>
    <td>boolean</td>
    <td>control view status</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
   <tr>
    <td>renderBackIcon</td>
    <td>JSX</td>
    <td>custom back icon</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
   <tr>
    <td>renderFullScreenBackIcon</td>
    <td>JSX</td>
    <td>custom full's fullscreen icon</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
   <tr>
    <td>renderMore</td>
    <td>JSX</td>
    <td>custom more icon</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
   <tr>
    <td>renderFullScreen</td>
    <td>JSX</td>
    <td>custom fullscreen icon</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
</table>
