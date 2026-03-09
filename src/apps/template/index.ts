import type { AppManifest } from '@mimisOS/sdk';
import { TemplateApp } from './TemplateApp';

const templateManifest: AppManifest = {
  id: 'template',
  name: '模板',
  icon: 'AppWindow',
  color: '#007AFF',
  component: TemplateApp,
};

export default templateManifest;
