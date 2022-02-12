import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useColorScheme } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Example } from './src/screens';
import { DarkTheme, LightTheme } from './src/theme/theme';
export type RootParamList = {
  Example: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

const App = gestureHandlerRootHOC(() => {
  const scheme = useColorScheme();
  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : LightTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Example"
          options={{
            title: 'Example',
            headerShown: false,
          }}
          component={Example}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});
export default App;
