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

let IconFlagoutline: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M618.666667 256 853.333333 256 853.333333 682.666667 554.666667 682.666667 533.333333 597.333333 298.666667 597.333333 298.666667 896 213.333333 896 213.333333 170.666667 597.333333 170.666667 618.666667 256M298.666667 256 298.666667 512 554.666667 512 576 597.333333 768 597.333333 768 341.333333 597.333333 341.333333 576 256 298.666667 256Z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconFlagoutline.defaultProps = {
  size: 18,
};

IconFlagoutline = React.memo ? React.memo(IconFlagoutline) : IconFlagoutline;

export default IconFlagoutline;
