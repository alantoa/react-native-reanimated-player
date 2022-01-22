type opacity = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

export const palette = {
  transparent: `rgba(0,0,0,0)`,
  Main: (opacity: opacity = 1) => `rgba(61, 219, 209, ${opacity})`,
  ActiveMain: (opacity: opacity = 1) => `rgba(41, 142, 136, ${opacity})`,
  Danger: (opacity: opacity = 1) => `rgba(255, 61, 74, ${opacity})`,
  Warning: (opacity: opacity = 1) => `rgba(255, 187, 0, ${opacity})`,
  Info: (opacity: opacity = 1) => `rgba(0, 99, 247, ${opacity})`,
  Success: (opacity: opacity = 1) => `rgba(1, 208, 134, ${opacity})`,
  W: (opacity: opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  G1: (opacity: opacity = 1) => `rgba(245, 247, 250, ${opacity})`,
  G2: (opacity: opacity = 1) => `rgba(225, 227, 229, ${opacity})`,
  G3: (opacity: opacity = 1) => `rgba(195, 197, 199, ${opacity})`,
  G4: (opacity: opacity = 1) => `rgba(157, 159, 163, ${opacity})`,
  G5: (opacity: opacity = 1) => `rgba(108, 110, 112, ${opacity})`,
  G6: (opacity: opacity = 1) => `rgba(39, 41, 46, ${opacity})`,
  G7: (opacity: opacity = 1) => `rgba(44, 45, 47, ${opacity})`,
  G8: (opacity: opacity = 1) => `rgba(23, 26, 31, ${opacity})`,
  B: (opacity: opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};
