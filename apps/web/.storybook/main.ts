import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook Configuration
 * 
 * Interview Discussion Points:
 * - Component documentation and visual testing
 * - Design system development
 * - Isolated component development
 * - Accessibility testing with a11y addon
 * - Collaboration with designers
 * 
 * @see https://storybook.js.org/docs/configure
 */
const config: StorybookConfig = {
  // Story file patterns
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  // Addons for enhanced functionality
  addons: [
    '@storybook/addon-essentials',     // Docs, controls, actions, viewport
    '@storybook/addon-a11y',           // Accessibility testing
    '@storybook/addon-links',          // Story linking
    '@storybook/addon-interactions',   // Interaction testing
  ],

  // Framework configuration
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // Documentation mode
  docs: {
    autodocs: 'tag',
  },

  // Static files directory
  staticDirs: ['../public'],

  // TypeScript configuration
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        // Filter out node_modules props
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },

  // Vite configuration overrides
  viteFinal: async (config) => {
    // Merge with existing Vite config
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': '/src',
        },
      },
    };
  },
};

export default config;
