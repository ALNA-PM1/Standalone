import { StrictMode } from 'react';
import './polyfills';
import '@xyflow/react/dist/style.css';
import { initializeIcons } from '@fluentui/react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
initializeIcons();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
