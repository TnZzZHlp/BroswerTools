import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: ({ browser }) => ({
    name: 'BroswerTools',
    description: 'Personal browser tools with global WebRTC privacy controls.',
    permissions: ['storage', 'privacy', 'activeTab', ...(browser === 'firefox' ? [] : ['scripting'])],
    ...(browser === 'firefox' ? {} : {
      minimum_chrome_version: '119',
      host_permissions: ['http://*/*', 'https://*/*'],
    }),
    ...(browser === 'firefox' ? {
      browser_specific_settings: {
        gecko: {
          id: 'broswertools@local.invalid',
          data_collection_permissions: { required: ['none'] },
        },
        gecko_android: {},
      },
    } : {}),
  }),
});
