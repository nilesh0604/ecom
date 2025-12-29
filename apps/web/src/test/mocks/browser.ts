import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW Browser Worker Setup
 * 
 * This worker can be used during development to mock API responses
 * in the browser without a real backend.
 * 
 * To enable in development:
 * 1. Initialize the service worker in main.tsx:
 *    ```typescript
 *    if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED) {
 *      const { worker } = await import('@/test/mocks/browser');
 *      await worker.start();
 *    }
 *    ```
 * 
 * 2. Run: npx msw init public/ --save
 *    This creates the service worker file in public/
 * 
 * 3. Set VITE_MSW_ENABLED=true in .env.development
 */

export const worker = setupWorker(...handlers);
