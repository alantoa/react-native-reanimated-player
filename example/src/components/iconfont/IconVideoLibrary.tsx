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

let IconVideoLibrary: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M170.666667 256H85.333333v597.333333c0 47.146667 38.186667 85.333333 85.333334 85.333334h597.333333v-85.333334H170.666667V256z m682.666666-170.666667H341.333333c-47.146667 0-85.333333 38.186667-85.333333 85.333334v512c0 47.146667 38.186667 85.333333 85.333333 85.333333h512c47.146667 0 85.333333-38.186667 85.333334-85.333333V170.666667c0-47.146667-38.186667-85.333333-85.333334-85.333334zM512 618.666667V234.666667l256 192-256 192z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconVideoLibrary.defaultProps = {
  size: 18,
};

IconVideoLibrary = React.memo ? React.memo(IconVideoLibrary) : IconVideoLibrary;

export default IconVideoLibrary;
