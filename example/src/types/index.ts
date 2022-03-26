import type React from 'react';

export type ContextType = {
  point: number;
};
export type SetContextType = React.Dispatch<React.SetStateAction<ContextType>>;
