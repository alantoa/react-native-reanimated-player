export const videoInfo = {
  title: 'Bad Guy',
  album: 'When We All Fall Asleep, Where Do We Go?',
  author: 'Billie Eilish',
  avatar: require('../assets/avatar.jpeg'),
  source: require('../assets/video-demo.mp4'),
  desc: 'A react native video player components demo, this is desc',
  createTime: '2 years ago',
};
export const springConfig = {
  mass: 0.5,
  overshootClamping: true,
};
export const VIDEO_MIN_HEIGHT = 120;

const prefix = 'https://img.alantoa.com/renimated-player/';

export const videos = [
  {
    cover: `${prefix}cover1.webp`,
    title: 'Blank Space live iHeartRadio Jingle Ball 2014/12/12',
    author: 'Taylor Swift',
    pv: '307k',
    avatar: `${prefix}avatar1.jpeg`,
  },
  {
    cover: `${prefix}cover0.webp`,
    title: 'Natural',
    author: 'Imagine Dragons',
    pv: '304k',
    avatar: `${prefix}avatar0.jpeg`,
  },
  {
    cover: `${prefix}cover3.webp`,
    title: 'Lose Yourself [HD] - Joker',
    author: 'Eminem',
    pv: '301k',
    avatar: `${prefix}avatar3.jpeg`,
  },
  {
    cover: `${prefix}cover2.jpeg`,
    title: 'Glassmorphism in React Native',
    author: 'William Candillon',
    pv: '302k',
    avatar: `${prefix}avatar2.jpeg`,
  },
];
