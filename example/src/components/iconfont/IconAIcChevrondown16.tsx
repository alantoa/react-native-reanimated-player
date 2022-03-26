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

let IconAIcChevrondown16: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M865.92 350.08a48 48 0 0 0-67.84 0L512 636.16l-286.08-286.08a48 48 0 1 0-67.84 67.84l320 320a48 48 0 0 0 67.84 0l320-320a48 48 0 0 0 0-67.84z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAIcChevrondown16.defaultProps = {
  size: 18,
};

IconAIcChevrondown16 = React.memo ? React.memo(IconAIcChevrondown16) : IconAIcChevrondown16;

export default IconAIcChevrondown16;
