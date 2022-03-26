/* tslint:disable */
/* eslint-disable */

import React, { FunctionComponent } from 'react';
import { ViewProps } from 'react-native';
import { Svg, GProps, Path } from 'react-native-svg';
import { getIconColor } from './helper';

interface Props extends GProps, ViewProps {
  size?: number;
  color?: string | string[];
}

let IconSubscriptions: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M681.984 681.984l-256-137.984 0 278.016zM937.984 512l0 342.016q0 34.005333-25.002667 59.008t-59.008 25.002667l-683.989333 0q-34.005333 0-59.008-25.002667t-25.002667-59.008l0-342.016q0-34.005333 25.002667-59.989333t59.008-25.984l683.989333 0q34.005333 0 59.008 25.984t25.002667 59.989333zM768 86.016l0 84.010667-512 0 0-84.010667 512 0zM854.016 342.016l-683.989333 0 0-86.016 683.989333 0 0 86.016z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconSubscriptions.defaultProps = {
  size: 18,
};

IconSubscriptions = React.memo ? React.memo(IconSubscriptions) : IconSubscriptions;

export default IconSubscriptions;
