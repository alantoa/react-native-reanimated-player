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

let IconFeedback: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M704 767.392A318.016 318.016 0 0 1 512 832a318.016 318.016 0 0 1-192-64.608C242.464 708.928 192 616.384 192 512c0-176.448 143.552-320 320-320s320 143.552 320 320c0 104.384-50.464 196.928-128 255.392M512 128C300.256 128 128 300.256 128 512c0 141.76 77.408 265.504 192 332.032A381.312 381.312 0 0 0 511.936 896h0.128A381.312 381.312 0 0 0 704 844.032c114.592-66.528 192-190.272 192-332.032 0-211.744-172.256-384-384-384"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M639.936 403.84C639.936 339.904 582.528 288 512 288c-70.592 0-128 51.936-128 115.84v15.52a32 32 0 1 0 64 0v-15.552c0-28.576 28.736-51.808 64-51.808 35.296 0 64 23.232 64 51.84v49.152c0.064 1.536-0.544 31.616-39.808 59.008a169.44 169.44 0 0 1-32.16 17.6 31.584 31.584 0 0 0-24 30.4v37.184a32 32 0 0 0 64 0v-15.488c41.952-20.672 65.696-46.464 79.04-69.696 18.56-32.512 16.992-59.84 16.896-60.64V403.84zM512 672a32 32 0 1 0 0 64 32 32 0 0 0 0-64"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconFeedback.defaultProps = {
  size: 18,
};

IconFeedback = React.memo ? React.memo(IconFeedback) : IconFeedback;

export default IconFeedback;
