import type { Meta, StoryObj } from '@storybook/react';
import Tabs, { Tab, TabPanel, TabsList, TabsPanels } from './Tabs';

/**
 * Tabs Component Stories
 * 
 * The Tabs component implements the compound components pattern
 * for flexible, accessible tabbed interfaces.
 */
const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Accessible tabs using compound components pattern.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/**
 * Default tabs example
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultTab="tab1" className="w-96">
      <TabsList>
        <Tab id="tab1">Account</Tab>
        <Tab id="tab2">Password</Tab>
        <Tab id="tab3">Notifications</Tab>
      </TabsList>
      <TabsPanels>
        <TabPanel id="tab1">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Account Settings</h3>
            <p className="text-gray-600">Manage your account details here.</p>
          </div>
        </TabPanel>
        <TabPanel id="tab2">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Password Settings</h3>
            <p className="text-gray-600">Change your password here.</p>
          </div>
        </TabPanel>
        <TabPanel id="tab3">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Notification Preferences</h3>
            <p className="text-gray-600">Configure your notifications.</p>
          </div>
        </TabPanel>
      </TabsPanels>
    </Tabs>
  ),
};

/**
 * Tabs with disabled tab
 */
export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultTab="tab1" className="w-96">
      <TabsList>
        <Tab id="tab1">Active</Tab>
        <Tab id="tab2" disabled>Disabled</Tab>
        <Tab id="tab3">Settings</Tab>
      </TabsList>
      <TabsPanels>
        <TabPanel id="tab1">
          <div className="p-4">Active tab content</div>
        </TabPanel>
        <TabPanel id="tab2">
          <div className="p-4">This tab is disabled</div>
        </TabPanel>
        <TabPanel id="tab3">
          <div className="p-4">Settings content</div>
        </TabPanel>
      </TabsPanels>
    </Tabs>
  ),
};

/**
 * Tabs with icons
 */
export const WithIcons: Story = {
  render: () => (
    <Tabs defaultTab="home" className="w-96">
      <TabsList>
        <Tab id="home">
          <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Tab>
        <Tab id="profile">
          <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </Tab>
        <Tab id="settings">
          <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Tab>
      </TabsList>
      <TabsPanels>
        <TabPanel id="home">
          <div className="p-4">Welcome home!</div>
        </TabPanel>
        <TabPanel id="profile">
          <div className="p-4">Your profile details</div>
        </TabPanel>
        <TabPanel id="settings">
          <div className="p-4">Application settings</div>
        </TabPanel>
      </TabsPanels>
    </Tabs>
  ),
};

/**
 * Full width tabs
 */
export const FullWidth: Story = {
  render: () => (
    <Tabs defaultTab="tab1" className="w-full max-w-xl">
      <TabsList className="w-full">
        <Tab id="tab1" className="flex-1 justify-center">Tab One</Tab>
        <Tab id="tab2" className="flex-1 justify-center">Tab Two</Tab>
        <Tab id="tab3" className="flex-1 justify-center">Tab Three</Tab>
      </TabsList>
      <TabsPanels>
        <TabPanel id="tab1">
          <div className="p-4 border rounded-b">First panel content</div>
        </TabPanel>
        <TabPanel id="tab2">
          <div className="p-4 border rounded-b">Second panel content</div>
        </TabPanel>
        <TabPanel id="tab3">
          <div className="p-4 border rounded-b">Third panel content</div>
        </TabPanel>
      </TabsPanels>
    </Tabs>
  ),
};
