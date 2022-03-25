import type { Theme } from '@react-navigation/native';

export type CustomTheme = Theme & {};

export const DarkTheme: CustomTheme = {
  colors: {
    background: 'rgb(33, 33, 33)',
    border: 'rgb(55, 55, 55)',
    card: 'rgb(18, 18, 18)',
    notification: '#fe1017',
    primary: '#fe1017',
    text: 'rgb(228, 228, 228)',
  },
  dark: true,
};
export const LightTheme: CustomTheme = {
  colors: {
    background: 'rgb(255, 255, 255)',
    border: 'rgb(236, 236, 236)',
    card: 'rgba(0,0,0,0.5)',
    notification: '#fe1017',
    primary: '#fe1017',
    text: 'rgb(0, 0, 0)',
  },
  dark: false,
};
