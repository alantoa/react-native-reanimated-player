import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Home } from './src/screens';

export type RootParamList = {
  Example: undefined;
};
const Stack = createNativeStackNavigator<RootParamList>();

const App = gestureHandlerRootHOC(() => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Example"
          options={{
            title: 'Example',
            headerShown: false,
          }}
          component={Home}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});
export default App;
