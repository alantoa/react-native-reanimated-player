type opacity = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

export const palette = {
  transparent: 'rgba(0,0,0,0)',
  Main: (opacity: opacity = 1) => `rgba(61, 219, 209, ${opacity})`,
  ActiveMain: (opacity: opacity = 1) => `rgba(41, 142, 136, ${opacity})`,
  Danger: (opacity: opacity = 1) => `rgba(255, 61, 74, ${opacity})`,
  Warning: (opacity: opacity = 1) => `rgba(255, 187, 0, ${opacity})`,
  Info: (opacity: opacity = 1) => `rgba(0, 99, 247, ${opacity})`,
  Success: (opacity: opacity = 1) => `rgba(1, 208, 134, ${opacity})`,
  W: (opacity: opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  G1: (opacity: opacity = 1) => `rgba(245, 247, 250, ${opacity})`,
  G2: (opacity: opacity = 1) => `rgba(230, 230, 230, ${opacity})`,
  G3: (opacity: opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
  G4: (opacity: opacity = 1) => `rgba(157, 159, 163, ${opacity})`,
  G5: (opacity: opacity = 1) => `rgba(96, 96, 96, ${opacity})`,
  G6: (opacity: opacity = 1) => `rgba(39, 41, 46, ${opacity})`,
  G7: (opacity: opacity = 1) => `rgba(44, 45, 47, ${opacity})`,
  G8: (opacity: opacity = 1) => `rgba(24, 24, 24, ${opacity})`,
  G9: (opacity: opacity = 1) => `rgba(3, 3, 3, ${opacity})`,
  B: (opacity: opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};
