export interface PlayerState {
  snapPoint: number;
  paused: boolean;
}

export const initialPlayerState: PlayerState = {
  snapPoint: 0,
  paused: true,
};
