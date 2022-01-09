import { Dimensions, Platform } from 'react-native';

export const normalize = (size: number) => size;
export const { width, height, scale, fontScale } = Dimensions.get('window');
export const isIos = Platform.OS === 'ios';
