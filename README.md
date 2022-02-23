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
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) 
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [react-native-orientation-locker](https://github.com/wonday/react-native-orientation-locker/)


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
- 100% built upon `react-native-reanimated` and `react-native-gusture-handle`.
- Support gestures switch full screen.
- Support double tap seek to back or ahead.
- ...

## TODO list
- Add more custom props
- Add Previous & Next button
- Rewrite the gesture section with react-native-gusture-handle V2
- ...and more
## Configuration

...

