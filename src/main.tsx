import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './core/system.css';
// 初始化内置 Widget 系统
import { initializeBuiltInWidgets } from './core/widgets';

// 初始化 Widget 注册表
initializeBuiltInWidgets();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
