<div align="center">
  <blockquote><i>`JSThread` to `JSThread`, `UIThread` to `UIThread`.</i></blockquote>
  <h1 align="center">React Native Awesome Video Player</h1>
  <h3 align="center">100% written in Typescript video player component, interaction is like Youtube player.</h3>
</div>


<div align="center">
  <img src="./assets/example.gif" width="30%" />
  <br/> 
</div>

## Installation

First you have to follow installation instructions of:
- [react-native-awesome-slider](https://github.com/alantoa/react-native-awesome-slider/) 
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) 
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [react-native-orientation-locker](https://github.com/wonday/react-native-orientation-locker/)
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)
- [react-native-video](https://github.com/react-native-video/react-native-video)

```sh
yarn add react-native-reanimated-player
```


## Example usage

```jsx
import VideoPlayer from 'react-native-reanimated-player';

export const Example = () => {
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
          onToggleAutoPlay={(state: boolean) => {
            console.log(`onToggleAutoPlay state: ${state}`);
          }}
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
- Rewrite the gesture section with react-native-gusture-handle V2
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
    <td>toggleResizeModeOnFullscreen</td>
    <td>boolean</td>
    <td>toggle resizeMode on fullscreen?</td>
    <td>❌</td>
    <td>true</td>
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
    <td>videoDefaultWidth</td>
    <td>number</td>
    <td>video default height</td>
    <td>❌</td>
    <td>screenWidth</td>
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
    <td>headerBarTitle</td>
    <td>string</td>
    <td>headerbar title on fullscreen mode</td>
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
    <td>initPaused</td>
    <td>boolean</td>
    <td>player init paused</td>
    <td>❌</td>
    <td>false</td>
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
    <td>onPanStartEvent</td>
    <td>function</td>
    <td>on pan start play event callback</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>onPanEvent</td>
    <td>function</td>
    <td>on pan play event callback</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
  <tr>
    <td>onPanEndEvent</td>
    <td>function</td>
    <td>on pan end play event callback</td>
    <td>❌</td>
    <td>undefined</td>
  </tr>
</table>


