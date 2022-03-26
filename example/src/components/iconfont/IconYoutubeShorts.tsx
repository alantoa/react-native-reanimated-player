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

let IconYoutubeShorts: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M628.850167 22.583333c96.583333-50.333333 216.166667-13.666667 267 81.916667 50.833333 95.583333 13.75 213.833333-82.833334 264.166667l-79.416666 41.75c68.416667 2.5 133.666667 40.083333 167.833333 104.333333 50.833333 95.583333 13.833333 213.833333-82.833333 264.166667l-423.5 222.5c-96.583333 50.333333-216.166667 13.666667-267-81.916667-50.833333-95.583333-13.75-213.833333 82.833333-264.166667l79.416667-41.75c-68.416667-2.5-133.666667-40.083333-167.833334-104.333333-50.833333-95.583333-13.75-213.833333 82.833334-264.166667L628.850167 22.583333 628.850167 22.583333zM400.266833 354.416667l256.333334 158.25-256.333334 157.5V354.416667L400.266833 354.416667z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconYoutubeShorts.defaultProps = {
  size: 18,
};

IconYoutubeShorts = React.memo ? React.memo(IconYoutubeShorts) : IconYoutubeShorts;

export default IconYoutubeShorts;
