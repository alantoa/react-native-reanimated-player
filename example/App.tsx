import {
  // DarkTheme,
  // DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useColorScheme } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Home } from './src/screens';
export type RootParamList = {
  Example: undefined;
};
export type CustomTheme = Theme & {
  transparent: string;
  Main: (opacity: number) => string;
  ActiveMain: (opacity: number) => string;
  Danger: (opacity: number) => string;
  Warning: (opacity: number) => string;
  Info: (opacity: number) => string;
  Success: (opacity: number) => string;
  W: (opacity: number) => string;
  G1: (opacity: number) => string;
  G2: (opacity: number) => string;
  G3: (opacity: number) => string;
  G4: (opacity: number) => string;
  G5: (opacity: number) => string;
  G6: (opacity: number) => string;
  G7: (opacity: number) => string;
  G8: (opacity: number) => string;
  B: (opacity: number) => string;
};
type opacity = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

const DarkTheme: CustomTheme = {
  colors: {
    background: 'rgba(23, 26, 31, 1)',
    border: 'rgb(39, 39, 41)',
    card: 'rgb(18, 18, 18)',
    notification: 'rgb(255, 69, 58)',
    primary: 'rgb(10, 132, 255)',
    text: 'rgb(229, 229, 231)',
  },
  dark: true,
  transparent: `rgba(0,0,0,0)`,
  Main: (opacity = 1) => `rgba(61, 219, 209, ${opacity})`,
  ActiveMain: (opacity = 1) => `rgba(41, 142, 136, ${opacity})`,
  Danger: (opacity = 1) => `rgba(255, 61, 74, ${opacity})`,
  Warning: (opacity = 1) => `rgba(255, 187, 0, ${opacity})`,
  Info: (opacity = 1) => `rgba(0, 99, 247, ${opacity})`,
  Success: (opacity = 1) => `rgba(1, 208, 134, ${opacity})`,
  W: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  G1: (opacity = 1) => `rgba(245, 247, 250, ${opacity})`,
  G2: (opacity = 1) => `rgba(225, 227, 229, ${opacity})`,
  G3: (opacity = 1) => `rgba(195, 197, 199, ${opacity})`,
  G4: (opacity = 1) => `rgba(157, 159, 163, ${opacity})`,
  G5: (opacity = 1) => `rgba(108, 110, 112, ${opacity})`,
  G6: (opacity = 1) => `rgba(39, 41, 46, ${opacity})`,
  G7: (opacity = 1) => `rgba(44, 45, 47, ${opacity})`,
  G8: (opacity = 1) => `rgba(23, 26, 31, ${opacity})`,
  B: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};
const LightTheme: CustomTheme = {
  colors: {
    background: `rgba(255, 255, 255, 1)`,
    border: 'rgb(39, 39, 41)',
    card: 'rgb(18, 18, 18)',
    notification: 'rgb(255, 69, 58)',
    primary: 'rgb(10, 132, 255)',
    text: 'rgb(229, 229, 231)',
  },
  dark: false,
  transparent: `rgba(0,0,0,0)`,
  Main: (opacity = 1) => `rgba(61, 219, 209, ${opacity})`,
  ActiveMain: (opacity = 1) => `rgba(41, 142, 136, ${opacity})`,
  Danger: (opacity = 1) => `rgba(255, 61, 74, ${opacity})`,
  Warning: (opacity = 1) => `rgba(255, 187, 0, ${opacity})`,
  Info: (opacity = 1) => `rgba(0, 99, 247, ${opacity})`,
  Success: (opacity = 1) => `rgba(1, 208, 134, ${opacity})`,
  W: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  G1: (opacity = 1) => `rgba(245, 247, 250, ${opacity})`,
  G2: (opacity = 1) => `rgba(225, 227, 229, ${opacity})`,
  G3: (opacity = 1) => `rgba(195, 197, 199, ${opacity})`,
  G4: (opacity = 1) => `rgba(157, 159, 163, ${opacity})`,
  G5: (opacity = 1) => `rgba(108, 110, 112, ${opacity})`,
  G6: (opacity = 1) => `rgba(39, 41, 46, ${opacity})`,
  G7: (opacity = 1) => `rgba(44, 45, 47, ${opacity})`,
  G8: (opacity = 1) => `rgba(23, 26, 31, ${opacity})`,
  B: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};
const DefaultTheme = {};
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
          component={Home}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});
export default App;
