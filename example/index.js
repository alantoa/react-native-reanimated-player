/**
 * @format
 */
import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import App from './App';
import { name as appName } from './app.json';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['[react-native-gesture-handler]']); // Ignore log notification by message

AppRegistry.registerComponent(appName, () => App);
