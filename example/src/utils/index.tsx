import { Dimensions, Platform } from 'react-native';

export const isIos = Platform.OS === 'ios';
export const { width, height, scale, fontScale } = Dimensions.get('window');
