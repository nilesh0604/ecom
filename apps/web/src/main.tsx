import { ThemeProvider } from '@/context';
import { initWebVitals } from '@/utils/webVitals';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './routes';
import { store } from './store';

// Initialize web vitals monitoring
initWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>
);
