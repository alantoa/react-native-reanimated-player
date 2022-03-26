import {
  ActionType,
  PlayerActions,
  SetPlayerPoint,
  SetPlayerStatus,
} from './actions';
import type { PlayerState } from './state';

export function playerReducer(
  store: PlayerState,
  action: PlayerActions,
): PlayerState {
  switch (action.type) {
    case ActionType.SetPlayerPoint:
      return { ...store, snapPoint: action.snapPoint };
    case ActionType.SetPlayerStatus:
      return { ...store, paused: action.paused };
    default:
      return store;
  }
}
export const setPlayerPoint = (index: number): SetPlayerPoint => {
  return {
    type: ActionType.SetPlayerPoint,
    snapPoint: index,
  };
};
export const setPlayerPaused = (paused: boolean): SetPlayerStatus => {
  return {
    type: ActionType.SetPlayerStatus,
    paused,
  };
};
