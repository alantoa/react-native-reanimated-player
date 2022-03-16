/* tslint:disable */
/* eslint-disable */

import React, { FunctionComponent } from 'react';
import type { ViewProps } from 'react-native';
import { Svg, GProps, Path } from 'react-native-svg';
import { getIconColor } from './helper';

interface Props extends GProps, ViewProps {
  size?: number;
  color?: string | string[];
}

let IconAIcChevronleft16: FunctionComponent<Props> = ({
  size,
  color,
  ...rest
}) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M673.92 865.92a48 48 0 0 0 0-67.84L387.84 512l286.08-286.08a48 48 0 1 0-67.84-67.84l-320 320a48 48 0 0 0 0 67.84l320 320a48 48 0 0 0 67.84 0z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAIcChevronleft16.defaultProps = {
  size: 18,
};

IconAIcChevronleft16 = React.memo
  ? React.memo(IconAIcChevronleft16)
  : IconAIcChevronleft16;

export default IconAIcChevronleft16;
