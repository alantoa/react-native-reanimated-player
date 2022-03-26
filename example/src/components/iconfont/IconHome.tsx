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

let IconHome: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M566.11170016 84.02564741l350.12082013 223.2042892A77.6722963 77.6722963 0 0 1 952.14301275 372.73357275v476.648992a77.6722963 77.6722963 0 0 1-77.6722963 77.6722963l-271.85303704-0.02589158V615.56306132H434.3277037v311.46590815l-258.90765392 0.05178194a77.6722963 77.6722963 0 0 1-77.67229629-77.6722963V365.97608297a77.6722963 77.6722963 0 0 1 36.73899615-66.02145186l348.95573568-216.44679942a77.6722963 77.6722963 0 0 1 82.6951052 0.51781572z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconHome.defaultProps = {
  size: 18,
};

IconHome = React.memo ? React.memo(IconHome) : IconHome;

export default IconHome;
