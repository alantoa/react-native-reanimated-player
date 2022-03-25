import { useContext } from 'react';
import { Context } from '../context';

export function useVideoTranstion() {
  const c = useContext(Context);
  return c;
}
