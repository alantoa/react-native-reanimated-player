/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Example, Example2, Home, Photos } from './src/screens';

export type RootParamList = {
  home: undefined;
  lightbox: undefined;
  example2: undefined;
  photos: {
    index: number;
    images: string[];
  };
};
const Stack = createNativeStackNavigator<RootParamList>();

const _App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
          component={Home}
        />
        <Stack.Screen name="lightbox" component={Example} />
        <Stack.Screen name="example2" component={Example2} />
        <Stack.Screen
          name="photos"
          options={{
            headerShown: false,
            animation: 'fade',
          }}
          component={Photos}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = gestureHandlerRootHOC(() => <_App />);
export default App;
