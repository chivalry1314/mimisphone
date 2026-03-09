import type { AppManifest } from '@mimisOS/sdk';
import { WeChatApp } from './WeChatApp';

const weChatManifest: AppManifest = {
  id: 'wechat',
  name: '微信',
  icon: 'MessageCircle',
  color: '#07c160',
  component: WeChatApp,
};

export default weChatManifest;
