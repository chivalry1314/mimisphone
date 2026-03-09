import type { AppManifest } from '@mimisOS/sdk';
import { WeatherApp } from './WeatherApp';

const weatherManifest: AppManifest = {
  id: 'weather',
  name: '天气',
  icon: 'Cloud',
  color: '#5AC8FA',
  component: WeatherApp,
};

export default weatherManifest;
