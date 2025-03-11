const storageDataProps = [
  'proxyHost',
  'proxyPort',
  'customWhiteList',
  'customBlackList',
  'useAnywhere',
  'addYbDomains'
];

const storageProps = [...storageDataProps, 'isProxyActive'];

const iconFrames = [
  'icons/icon16.png',
  'icons/active_icon16.png',
];

const youtubeDomains = [
  '*.googlevideo.com',
  '*.youtube.com',
  'youtu.be',
  'youtube.com',
  'yt.be',
  '*.ytimg.com',
  '*.ggpht.com',
  'gvt1.com',
  'youtube-nocookie.com',
  'youtube-ui.l.google.com',
  'youtubeembeddedplayer.googleapis.com',
  'youtube.googleapis.com',
  'youtubei.googleapis.com',
  'yt-video-upload.l.google.com',
  'wide-youtube.l.google.com',
  'googleads.g.doubleclick.net',
  'play.google.com'
];

const activeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" stroke="green" stroke-width="2" fill="none" />
  <path d="M10 12l2 2 4-4" stroke="green" stroke-width="2" fill="none" />
  <animate attributeType="CSS" attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite"/>
</svg>
`;

const inactiveSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" stroke="gray" stroke-width="2" fill="none" />
  <path d="M8 12h8" stroke="gray" stroke-width="2" fill="none" />
</svg>
`;