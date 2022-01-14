const padStart: (
  string?: string,
  length?: number,
  chars?: string,
) => string = require('lodash.padstart');

/**
 * Format a time string as mm:ss
 *
 * @param {int} time time in milliseconds
 * @return {string} formatted time string in mm:ss format
 */
export const formatTime = ({
  time = 0,
  symbol = '',
  duration = 0,
  showHours = false,
}) => {
  time = Math.min(Math.max(time, 0), duration);

  if (!showHours) {
    const formattedMinutes = padStart(Math.floor(time / 60).toFixed(0), 2, '0');
    const formattedSeconds = padStart(Math.floor(time % 60).toFixed(0), 2, '0');

    return `${symbol}${formattedMinutes}:${formattedSeconds}`;
  }

  const formattedHours = padStart(Math.floor(time / 3600).toFixed(0), 2, '0');
  const formattedMinutes = padStart(
    (Math.floor(time / 60) % 60).toFixed(0),
    2,
    '0',
  );
  const formattedSeconds = padStart(Math.floor(time % 60).toFixed(0), 2, '0');

  return `${symbol}${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export const secondToTime = (seconds: number): string => {
  const hour = Math.floor(seconds / 3600);
  const residualFromHour = seconds % 3600;
  const minute = `${Math.floor(residualFromHour / 60)}`.padStart(2, '0');
  const second = `${Math.floor(residualFromHour % 60)}`.padStart(2, '0');
  let output = `${minute}:${second}`;
  hour && (output = `${hour}:${output}`);
  return output;
};

/**
 * Format a time string as mm:ss
 *
 * @param {int} time time in milliseconds
 * @return {string} formatted time string in mm:ss format
 */
export const formatTimeToMins = (duration: number) => {
  const formattedMinutes = padStart(
    (Math.floor(duration / 60) % 60).toFixed(0),
    2,
    '0',
  );
  const formattedSeconds = padStart(
    Math.floor(duration % 60).toFixed(0),
    2,
    '0',
  );

  return `${formattedMinutes}:${formattedSeconds}`;
};
