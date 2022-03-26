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

let IconCloseBold: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M564.49999971 512l236.25-236.25c15.00000029-15.00000029 15.00000029-37.50000029 0-52.49999971-15.00000029-15.00000029-37.50000029-15.00000029-52.49999971 0L512 459.50000029 275.75 223.25000029c-15.00000029-15.00000029-37.50000029-15.00000029-52.49999971 0-15.00000029 15.00000029-15.00000029 37.50000029 0 52.49999971L459.50000029 512 223.25000029 748.25c-15.00000029 15.00000029-15.00000029 37.50000029 0 52.49999971 7.49999971 7.49999971 16.875 11.25 26.24999942 11.25s18.74999971-3.75000029 26.25000029-11.25L512 564.49999971l236.25 236.25c7.49999971 7.49999971 16.875 11.25 26.25000029 11.25s18.74999971-3.75000029 26.24999942-11.25c15.00000029-15.00000029 15.00000029-37.50000029 0-52.49999971L564.49999971 512z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconCloseBold.defaultProps = {
  size: 18,
};

IconCloseBold = React.memo ? React.memo(IconCloseBold) : IconCloseBold;

export default IconCloseBold;
