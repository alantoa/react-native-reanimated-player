import type { Dispatch } from 'react';
import { createContext } from 'react';
import type { PlayerActions } from './actions';
import { initialPlayerState, PlayerState } from './state';

export const PlayerContext = createContext<{
  store: PlayerState;
  dispatch: Dispatch<PlayerActions>;
}>({
  store: initialPlayerState,
  dispatch: () => undefined,
});
