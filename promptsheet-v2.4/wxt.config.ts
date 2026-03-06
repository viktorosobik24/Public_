import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'PromptSheet',
    permissions: ['sidePanel', 'storage', 'clipboardWrite'],
    side_panel: {
      default_path: 'sidepanel.html',
    },
    action: {},
  },
});
