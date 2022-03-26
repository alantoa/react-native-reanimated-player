export enum ActionType {
  SetPlayerStatus,
  SetPlayerPoint,
}

export interface SetPlayerStatus {
  type: ActionType.SetPlayerStatus;
  paused: boolean;
}
export interface SetPlayerPoint {
  type: ActionType.SetPlayerPoint;
  snapPoint: number;
}

export type PlayerActions = SetPlayerStatus | SetPlayerPoint;
