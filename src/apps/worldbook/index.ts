import type { AppManifest } from '@mimisOS/sdk';
import { WorldBookApp } from './WorldBookApp';

const worldBookManifest: AppManifest = {
  id: 'worldbook',
  name: '备忘录',
  icon: 'StickyNote',
  color: '#FF9500',
  component: WorldBookApp,
};

export default worldBookManifest;
