import { PortalProvider } from '@gorhom/portal';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useColorScheme } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { Context } from './src/context';
import BottomTabNavigator from './src/navigators/bottom-navigate';
import { VideoScreen } from './src/screens/video';
import { DarkTheme, LightTheme } from './src/theme/theme';

export type RootParamList = {
  root: undefined;
};

const { Navigator, Screen } = createNativeStackNavigator<RootParamList>();

const App = gestureHandlerRootHOC(() => {
  const scheme = useColorScheme();
  const videoTranslateY = useSharedValue(0);
  return (
    <PortalProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Context.Provider value={{ videoTranslateY }}>
          <NavigationContainer
            theme={scheme === 'dark' ? DarkTheme : LightTheme}>
            <Navigator
              screenOptions={{
                headerShown: false,
              }}
              initialRouteName={'root'}>
              <Screen name="root" component={BottomTabNavigator} />
            </Navigator>
            <VideoScreen />
          </NavigationContainer>
        </Context.Provider>
      </SafeAreaProvider>
    </PortalProvider>
  );
});
export default App;
