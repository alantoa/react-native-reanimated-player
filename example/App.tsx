import { PortalProvider } from '@gorhom/portal';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useReducer } from 'react';
import { useColorScheme } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import BottomTabNavigator from './src/navigators/bottom-navigate';
import { VideoScreen } from './src/screens/video';
import { PlayerContext } from './src/state/context';
import { playerReducer } from './src/state/reducer';
import { initialPlayerState } from './src/state/state';
import { DarkTheme, LightTheme } from './src/theme/theme';

export type RootParamList = {
  root: undefined;
};

const { Navigator, Screen } = createNativeStackNavigator<RootParamList>();

const App = gestureHandlerRootHOC(() => {
  const scheme = useColorScheme();
  const videoTranslateY = useSharedValue(0);
  const [store, dispatch] = useReducer(playerReducer, initialPlayerState);

  return (
    <PortalProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <PlayerContext.Provider value={{ store, dispatch }}>
          <NavigationContainer
            theme={scheme === 'dark' ? DarkTheme : LightTheme}>
            <Navigator
              screenOptions={{
                headerShown: false,
              }}
              initialRouteName={'root'}>
              <Screen name="root">
                {() => <BottomTabNavigator videoTranslateY={videoTranslateY} />}
              </Screen>
            </Navigator>
            <VideoScreen videoTranslateY={videoTranslateY} />
          </NavigationContainer>
        </PlayerContext.Provider>
      </SafeAreaProvider>
    </PortalProvider>
  );
});
export default App;
