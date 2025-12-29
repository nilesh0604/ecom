import type { Preview } from '@storybook/react';
import '../src/index.css'; // Import global styles including Tailwind

/**
 * Storybook Preview Configuration
 * 
 * Global decorators, parameters, and configuration
 * that apply to all stories.
 */

const preview: Preview = {
  parameters: {
    // Actions configuration for event handling
    actions: { argTypesRegex: '^on[A-Z].*' },

    // Controls configuration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // Backgrounds for theme testing
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'gray', value: '#f5f5f5' },
      ],
    },

    // Viewport presets for responsive testing
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
        wide: {
          name: 'Wide',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },

    // Layout configuration
    layout: 'centered',

    // Accessibility addon configuration
    a11y: {
      // Optional: customize axe-core rules
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'landmark-one-main', enabled: false }, // Disable for component-level stories
        ],
      },
    },
  },

  // Global decorators applied to all stories
  decorators: [
    // Add any global wrappers here
    // Example: Theme provider, Redux provider, etc.
    (Story) => (
      <div className="font-sans">
        <Story />
      </div>
    ),
  ],

  // Global args available to all stories
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
