/* tslint:disable */
/* eslint-disable */

import React, { FunctionComponent } from 'react';
import { ViewProps } from 'react-native';
import { GProps } from 'react-native-svg';
import IconCloseBold from './IconCloseBold';
import IconAdd from './IconAdd';
import IconYoutubeShorts from './IconYoutubeShorts';
import IconSubscriptions from './IconSubscriptions';
import IconVideoLibrary from './IconVideoLibrary';
import IconHome from './IconHome';
import IconClose from './IconClose';
import IconAIcChevrondown16 from './IconAIcChevrondown16';
import IconFlagoutline from './IconFlagoutline';
import IconSetting from './IconSetting';
import IconFeedback from './IconFeedback';
export { default as IconCloseBold } from './IconCloseBold';
export { default as IconAdd } from './IconAdd';
export { default as IconYoutubeShorts } from './IconYoutubeShorts';
export { default as IconSubscriptions } from './IconSubscriptions';
export { default as IconVideoLibrary } from './IconVideoLibrary';
export { default as IconHome } from './IconHome';
export { default as IconClose } from './IconClose';
export { default as IconAIcChevrondown16 } from './IconAIcChevrondown16';
export { default as IconFlagoutline } from './IconFlagoutline';
export { default as IconSetting } from './IconSetting';
export { default as IconFeedback } from './IconFeedback';

export type IconNames = 'close-bold' | 'add' | 'youtube-shorts' | 'subscriptions' | 'video_library' | 'home' | 'close' | 'a-ic_chevrondown_16' | 'flagoutline' | 'setting' | 'feedback';

interface Props extends GProps, ViewProps {
  name: IconNames;
  size?: number;
  color?: string | string[];
}

let IconFont: FunctionComponent<Props> = ({ name, ...rest }) => {
  switch (name) {
    case 'close-bold':
      return <IconCloseBold key="1" {...rest} />;
    case 'add':
      return <IconAdd key="2" {...rest} />;
    case 'youtube-shorts':
      return <IconYoutubeShorts key="3" {...rest} />;
    case 'subscriptions':
      return <IconSubscriptions key="4" {...rest} />;
    case 'video_library':
      return <IconVideoLibrary key="5" {...rest} />;
    case 'home':
      return <IconHome key="6" {...rest} />;
    case 'close':
      return <IconClose key="7" {...rest} />;
    case 'a-ic_chevrondown_16':
      return <IconAIcChevrondown16 key="8" {...rest} />;
    case 'flagoutline':
      return <IconFlagoutline key="9" {...rest} />;
    case 'setting':
      return <IconSetting key="10" {...rest} />;
    case 'feedback':
      return <IconFeedback key="11" {...rest} />;
  }

  return null;
};

IconFont = React.memo ? React.memo(IconFont) : IconFont;

export default IconFont;
