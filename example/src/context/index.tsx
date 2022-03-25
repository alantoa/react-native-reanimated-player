import React from 'react';
import type { ContextType } from '../types';
export const Context = React.createContext<ContextType>({
  videoTranslateY: { value: 0 },
});
